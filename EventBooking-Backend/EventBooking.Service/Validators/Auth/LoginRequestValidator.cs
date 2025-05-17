using EventBooking.Service.DTOs.Auth;
using FluentValidation;

namespace EventBooking.Service.Validators.Auth;

public class LoginRequestValidator : AbstractValidator<LoginRequestDto>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Invalid email format");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters");

        RuleFor(x => x.DeviceId)
            .NotEmpty().WithMessage("Device ID is required");

        RuleFor(x => x.DeviceName)
            .NotEmpty().WithMessage("Device name is required");

        RuleFor(x => x.DeviceType)
            .NotEmpty().WithMessage("Device type is required");

        RuleFor(x => x.Platform)
            .NotEmpty().WithMessage("Platform is required");
    }
}