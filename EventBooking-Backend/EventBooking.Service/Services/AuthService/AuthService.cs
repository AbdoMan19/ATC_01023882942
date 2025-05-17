using EventBooking.DB.Models;
using EventBooking.Service.Common;
using EventBooking.Service.DTOs.Auth;
using EventBooking.Service.Services.TokenService;
using EventBooking.Service.Services.UserDeviceService;
using EventBooking.Service.Utilities;
using EventBooking.UnitOfWork;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

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
    //logger
    private readonly ILogger<AuthService> _logger;


    public AuthService(
        ITokenService tokenService, ILogger<AuthService> logger, UserManager<User> userManager , SignInManager<User> signInManager , IUnitOfWork unitOfWork , IUserDeviceService userDeviceService , RoleManager<IdentityRole<Guid>> roleManager)
    {
        _tokenService = tokenService;
        _userManager = userManager;
        _signInManager = signInManager;
        _unitOfWork = unitOfWork;
        _userDeviceService = userDeviceService;
        _roleManager = roleManager;
        _logger = logger;
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
            .AsNoTracking()
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
            
        }
        var accessToken = await _tokenService.GenerateJwtToken(user, userDevice);
        var refreshToken = _tokenService.GenerateRefreshToken();        // First save the UserDevice to get an ID if it's new
        if (userDevice.Id == Guid.Empty)
        {
            await _unitOfWork.SaveChanges();
        }
        
        if (userDevice.RefreshToken != null)
        {
            Console.WriteLine("Refresh token exists");
            // Update existing refresh token
            userDevice.RefreshToken.Token = refreshToken;
            userDevice.RefreshToken.Expires = _tokenService.GetRefreshTokenExpirationDays();
            await _unitOfWork.Repository<RefreshToken>().Update(userDevice.RefreshToken);
        }
        else
        {
            // Save the UserDevice first
            await _unitOfWork.SaveChanges();
            
            // Then create and save the RefreshToken
            var refreshTokenObj = _tokenService.GenerateRefreshToken(userDevice);
            await _unitOfWork.Repository<RefreshToken>().Add(refreshTokenObj);
            await _unitOfWork.SaveChanges();
            
            // Finally update the UserDevice with the RefreshTokenId
            userDevice.RefreshTokenId = refreshTokenObj.Id;
            await _unitOfWork.Repository<UserDevice>().Update(userDevice);
        }

        // Final save
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
        //log the all the attribute in the request
        _logger.LogInformation("Registering user with the following details: {Name}, {Email}, {Password}, {ConfirmPassword} ,{DeviceId}, {DeviceName}, {DeviceType}, {Platform}", 
            request.Name, request.Email, request.Password,request.ConfirmPassword , request.DeviceId, request.DeviceName, request.DeviceType, request.Platform);
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

        var citizenRoleName = "ADMIN";
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
    //change password
    public async Task<GenericResponseModel<bool>> ChangePasswordAsync(ChangePasswordRequestDto request)
    {
        var userId = await _tokenService.GetCurrentUserIdAsync();
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            return GenericResponseModel<bool>.Failure("User not found", new List<ErrorResponseModel>
            {
                ErrorResponseModel.Create("User", "User not found")
            });
        }
        //log the old and the new
        _logger.LogInformation("Changing password for user with the following details: {UserId}, {OldPassword}, {NewPassword}", 
            userId, request.OldPassword, request.NewPassword);
        var result = await _userManager.ChangePasswordAsync(user, request.OldPassword, request.NewPassword);
        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => ErrorResponseModel.Create(e.Code, e.Description)).ToList();
            return GenericResponseModel<bool>.Failure("Change password failed", errors);
        }
        return GenericResponseModel<bool>.Success(true);
    }
       
        
    

}