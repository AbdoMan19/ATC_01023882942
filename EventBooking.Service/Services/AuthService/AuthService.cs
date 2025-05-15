using EventBooking.DB.Models;
using EventBooking.Service.Common;
using EventBooking.Service.DTOs.Auth;
using EventBooking.Service.Services.TokenService;
using EventBooking.Service.Services.UserDeviceService;
using EventBooking.Service.Utilities;
using EventBooking.UnitOfWork;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace EventBooking.Service.Services.AuthService;

public class AuthService : IAuthService
{
    private readonly ITokenService _tokenService;
    //user manager
    private readonly UserManager<User> _userManager;
    
    //sign in manager
    private readonly SignInManager<User> _signInManager;
    
    //unit of work
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserDeviceService _userDeviceService;
    
    //role manager
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;


    public AuthService(
        ITokenService tokenService , UserManager<User> userManager , SignInManager<User> signInManager , IUnitOfWork unitOfWork , IUserDeviceService userDeviceService , RoleManager<IdentityRole<Guid>> roleManager)
    {
        _tokenService = tokenService;
        _userManager = userManager;
        _signInManager = signInManager;
        _unitOfWork = unitOfWork;
        _userDeviceService = userDeviceService;
        _roleManager = roleManager;
        // role manager


    }

    public async Task<GenericResponseModel<AuthResponseDto>> LoginAsync(LoginRequestDto request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            return GenericResponseModel<AuthResponseDto>.Failure(
                "Invalid credentials",
                new List<ErrorResponseModel> 
                { 
                    ErrorResponseModel.Create("", "Invalid email or password") 
                });
        }
        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, true);
        if (!result.Succeeded)
        {
            await _userManager.AccessFailedAsync(user);
            return GenericResponseModel<AuthResponseDto>.Failure(
                "Invalid credentials",
                new List<ErrorResponseModel> 
                { 
                    ErrorResponseModel.Create("", "Invalid email or password") 
                });
        }
        

        await _userManager.ResetAccessFailedCountAsync(user);

        var userDevice = await _unitOfWork.Repository<UserDevice>()
            .FindBy(d => d.UserId == user.Id && d.DeviceId == request.DeviceId)
            .Include(u => u.RefreshToken)
            .FirstOrDefaultAsync();

        if (userDevice == null)
        {
            userDevice = new UserDevice
            {
                UserId = user.Id,
                DeviceId = request.DeviceId,
                DeviceName = request.DeviceName,
                DeviceType = request.DeviceType,
                Platform = request.Platform
            };
            await _unitOfWork.Repository<UserDevice>().Add(userDevice);
        }
        else
        {
            userDevice.LastUsedAt = DateTime.UtcNow;
            await _unitOfWork.Repository<UserDevice>().Update(userDevice);
        }
        var accessToken = await _tokenService.GenerateJwtToken(user, userDevice);
        var refreshToken = _tokenService.GenerateRefreshToken();

        if (userDevice.RefreshToken != null)
        {
            // Update existing refresh token
            userDevice.RefreshToken.Token = refreshToken;
            userDevice.RefreshToken.Expires = _tokenService.GetRefreshTokenExpirationDays();
            await _unitOfWork.Repository<RefreshToken>().Update(userDevice.RefreshToken);
        }
        else
        {
            var refreshTokenObj = _tokenService.GenerateRefreshToken(userDevice);
            // Add new refresh token
            userDevice.RefreshToken = refreshTokenObj;
            await _unitOfWork.Repository<RefreshToken>().Add(refreshTokenObj);
        }

        // Single database call
        await _unitOfWork.SaveChanges();
        var userRole = (await _userManager.GetRolesAsync(user))[0];
        return GenericResponseModel<AuthResponseDto>.Success(new AuthResponseDto
        {
            Tokens = new TokenResponseDto()
            {
                Token = accessToken,
                RefreshToken = refreshToken,
                ExpiresAt = _tokenService.GetTokenExpiration()
            },
            User = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                CreatedAt = user.CreatedAt,
                Role = userRole,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
            }
        });
        
    }

    public async Task<GenericResponseModel<AuthResponseDto>> RegisterAsync(RegisterRequestDto request)
    {
        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            EmailConfirmed = true,
            UserName = request.Email,
            
        };
        
        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => ErrorResponseModel.Create(e.Code, e.Description)).ToList();
            return GenericResponseModel<AuthResponseDto>.Failure("Registration failed", errors);
        }

        var citizenRoleName = "USER";
        if (!await _roleManager.RoleExistsAsync(citizenRoleName))
        {
            await _roleManager.CreateAsync(new IdentityRole<Guid>(citizenRoleName));
        }

        await _userManager.AddToRoleAsync(user, citizenRoleName);
        
        //add user device to the user and generate the tokens
        var userDevice = new UserDevice
        {
            DeviceId = request.DeviceId,
            DeviceName = request.DeviceName,
            DeviceType = request.DeviceType,
            Platform = request.Platform,
            UserId = user.Id //55
        };
        
        // Generate new tokens
        var accessToken = await _tokenService.GenerateJwtToken(user, userDevice);
        var refreshTokenObj = _tokenService.GenerateRefreshToken(userDevice);
        // Add new refresh token
        userDevice.RefreshToken = refreshTokenObj;
        await _unitOfWork.Repository<UserDevice>().Add(userDevice);
        await _unitOfWork.Repository<RefreshToken>().Add(refreshTokenObj);
        

        // Single database call
        await _unitOfWork.SaveChanges();
        return GenericResponseModel<AuthResponseDto>.Success(new AuthResponseDto
        {
            Tokens = new TokenResponseDto
            {
                Token = accessToken,
                RefreshToken = refreshTokenObj.Token,
                ExpiresAt = _tokenService.GetTokenExpiration()
            },
            User = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                CreatedAt = user.CreatedAt,
                Role = citizenRoleName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
            }
        });
        
    }

    public async  Task<GenericResponseModel<TokenResponseDto>> RefreshTokenAsync(RefreshTokenRequest request)
    {
        var refreshToken = await _unitOfWork.Repository<RefreshToken>()
            .FindBy(x => x.Token == request.RefreshToken)
            .AsNoTracking()
            .Include(r => r.UserDevice)
            .ThenInclude(u => u.User)
            .FirstOrDefaultAsync();
        
        if(refreshToken is null || refreshToken.IsExpired)
        {
            return GenericResponseModel<TokenResponseDto>.Failure(Constants.FailureMessage, new List<ErrorResponseModel>
            {
                ErrorResponseModel.Create("RefreshToken", "Invalid or expired refresh token")
            });
        }
        var (newAccessToken, newRefreshToken) = await _tokenService.RefreshTokenAsync(
            refreshToken);
        return GenericResponseModel<TokenResponseDto>.Success(new TokenResponseDto
        {
            Token = newAccessToken,
            RefreshToken = newRefreshToken,
            ExpiresAt = _tokenService.GetTokenExpiration()
        });
    }

    public async Task<GenericResponseModel<bool>> LogoutAsync()
    {
        var userId = await _tokenService.GetCurrentUserIdAsync();
        var currentDeviceId = _userDeviceService.GetCurrentDeviceId();
        if (currentDeviceId == null)
        {
      
            return GenericResponseModel<bool>.Failure(Constants.FailureMessage , 
                new List<ErrorResponseModel> {ErrorResponseModel.Create("DeviceId", "Invalid Device Id")});
        }

        await _tokenService.RevokeDeviceTokensAsync(userId, currentDeviceId);
        return GenericResponseModel<bool>.Success(true);
    }
       
        
    

}