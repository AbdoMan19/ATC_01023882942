namespace EventBooking.Service.DTOs.Auth;

public class LoginRequestDto
{
    public string Email { get; set; }
    public string Password { get; set; }
    //devices
    public string DeviceName { get; set; }
    public string DeviceId { get; set; }
    public string DeviceType { get; set; }
    
    public string Platform { get; set; }
    
}