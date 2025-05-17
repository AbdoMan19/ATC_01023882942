using EventBooking.DB.Models;

namespace EventBooking.Service.Services.TokenService;

public interface ITokenService
{
    Task<Guid> GetCurrentUserIdAsync();
    Task<string> GenerateJwtToken(User user, UserDevice device);
    DateTime GetTokenExpiration();

    // Refresh Token
    string GenerateRefreshToken();
    RefreshToken GenerateRefreshToken(UserDevice userDevice);
    Task<(string JwtToken, string RefreshToken)> RefreshTokenAsync(RefreshToken refreshToken);
    DateTime GetRefreshTokenExpirationDays();
    Task<bool> RevokeDeviceTokensAsync(Guid userId, string deviceId);
}