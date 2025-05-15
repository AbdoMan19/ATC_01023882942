using EventBooking.Service.Common;
using EventBooking.Service.DTOs.Auth;

namespace EventBooking.Service.Services.AuthService;

public interface IAuthService
{
    
    Task<GenericResponseModel<AuthResponseDto>> LoginAsync(LoginRequestDto request);
    Task<GenericResponseModel<AuthResponseDto>> RegisterAsync(RegisterRequestDto request);
    Task<GenericResponseModel<TokenResponseDto>> RefreshTokenAsync(RefreshTokenRequest request);
    Task<GenericResponseModel<bool>> LogoutAsync();

}