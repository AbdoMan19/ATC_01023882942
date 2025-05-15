namespace EventBooking.Service.DTOs.Auth;

public class RegisterRequestDto
{
    public string Name { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
    public string ConfirmPassword { get; set; }
    
    public string DeviceName { get; set; }
    public string DeviceId { get; set; }
    public string DeviceType { get; set; }
    
    public string Platform { get; set; }
}