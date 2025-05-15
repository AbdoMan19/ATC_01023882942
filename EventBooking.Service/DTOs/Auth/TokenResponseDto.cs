namespace EventBooking.Service.DTOs.Auth;

public class TokenResponseDto
{
    public string Token { get; set; }
    public string RefreshToken { get; set; }
    public DateTime ExpiresAt { get; set; }
}