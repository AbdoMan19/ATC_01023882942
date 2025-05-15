using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using EventBooking.DB.Models;
using EventBooking.Service.Services.UserDeviceService;
using EventBooking.UnitOfWork;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace EventBooking.Service.Services.TokenService;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;
    private readonly string _key;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly UserManager<User> _userManager;
    private readonly IHttpContextAccessor _contextAccessor;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserDeviceService _userDeviceService;

    public TokenService(IUserDeviceService userDeviceService , IConfiguration configuration , UserManager<User>userManager , IHttpContextAccessor contextAccessor , IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
        _userManager = userManager;
        _configuration = configuration;
        _key = _configuration["Jwt:Key"];
        _issuer = _configuration["Jwt:Issuer"];
        _audience = _configuration["Jwt:Audience"];
        _contextAccessor = contextAccessor;
        _userDeviceService = userDeviceService;
    }

public async Task<(string AccessToken, string RefreshToken)> GenerateTokensForDeviceAsync(
        User user,
        string deviceId,
        string deviceName,
        string platform,
        string deviceType)
    {
        var userDevice = await _userDeviceService.RegisterDeviceAsync(
            user.Id,
            deviceId,
            deviceName,
            platform,
            deviceType);

        var accessToken = await GenerateJwtToken(user, userDevice);
        var refreshToken = GenerateRefreshToken(userDevice);

        userDevice.RefreshToken = refreshToken;
        await _unitOfWork.Repository<UserDevice>().Update(userDevice);
        await _unitOfWork.SaveChanges();

        return (accessToken, refreshToken.Token);
    }

    public async Task<string> GenerateJwtToken(User user, UserDevice device)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email ?? string.Empty),
            new(ClaimTypes.Name,user.Name),
        };

        var roles = await _userManager.GetRolesAsync(user);
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));
        claims.AddRange(new[]
        {
            new Claim("DeviceId", device.DeviceId),
            new Claim("DeviceName", device.DeviceName),
            new Claim("Platform", device.Platform)
        });

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = GetTokenExpiration();

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: expires,
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
    }

    public RefreshToken GenerateRefreshToken(UserDevice userDevice)
    {
        var refreshToken = new RefreshToken
        {
            Token = GenerateRefreshToken(),
            UserDeviceId = userDevice.Id,
            Expires = GetRefreshTokenExpirationDays(),
            CreatedAt = DateTime.UtcNow
        };
        return refreshToken;
    }

    public DateTime GetTokenExpiration()
    {
        double minutesToExpire = 5;
        if (double.TryParse(_configuration["Jwt:TokenExpirationMinutes"], out double configMinutes))
        {
            minutesToExpire = configMinutes;
        }
        return DateTime.UtcNow.AddMinutes(minutesToExpire);
    }
    public DateTime GetRefreshTokenExpirationDays()
    {
        int daysToExpire = 7;
        if (int.TryParse(_configuration["Jwt:RefreshTokenExpirationDays"], out int configDays))
        {
            daysToExpire = configDays;
        }
        return DateTime.UtcNow.AddDays(daysToExpire);
    }
 


    public Task<Guid> GetCurrentUserIdAsync()
    {
        var userId = _contextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
        return userId != null ? Task.FromResult(Guid.Parse(userId)) : Task.FromResult(Guid.Empty);
    }
    public async Task<(string JwtToken, string RefreshToken)> RefreshTokenAsync(RefreshToken refreshToken)
    {

        var userDevice = refreshToken.UserDevice;

        var user = userDevice?.User;
        var newAccessToken = await GenerateJwtToken(user, userDevice);
        var newRefreshToken = GenerateRefreshToken(userDevice);

        refreshToken.Token = newRefreshToken.Token;
        refreshToken.Expires = GetRefreshTokenExpirationDays();

        userDevice.LastUsedAt = DateTime.UtcNow;
        await _unitOfWork.Repository<UserDevice>().Update(userDevice);
        await _unitOfWork.Repository<RefreshToken>().Update(refreshToken);
        await _unitOfWork.SaveChanges();

        return (newAccessToken, newRefreshToken.Token);
    }


    public async Task<bool> RevokeDeviceTokensAsync(Guid userId, string deviceId)
    {
        var userDevice = await _unitOfWork.Repository<UserDevice>()
            .FindBy(d => d.UserId == userId && d.DeviceId == deviceId)
            .Include(d => d.RefreshToken)
            .FirstOrDefaultAsync();

        if (userDevice?.RefreshToken == null || userDevice.RefreshToken.IsExpired)
        {
            return false;
        }

        userDevice.RefreshToken.Expires = DateTime.UtcNow;
        await _unitOfWork.Repository<RefreshToken>().Update(userDevice.RefreshToken);
        await _unitOfWork.SaveChanges();

        return true;
    }
}