using EventBooking.DB.Enums;

namespace EventBooking.Service.DTOs.Auth;

public class AuthResponseDto
{
    public UserDto User { get; set; }
    public TokenResponseDto Tokens { get; set; }
}

public class UserDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string Role { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? PhoneNumber { get; set; }
  
}