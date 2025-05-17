using EventBooking.Service.DTOs.Event;
using FluentValidation;

namespace EventBooking.Service.Validators.Event;

public class EventFilterDtoValidator : AbstractValidator<EventFilterDto>
{
    public EventFilterDtoValidator()
    {
        // Validate price range
        When(x => x.MinPrice.HasValue, () =>
        {
            RuleFor(x => x.MinPrice!.Value)
                .GreaterThanOrEqualTo(0).WithMessage("Minimum price cannot be negative");
        });
        
        When(x => x.MaxPrice.HasValue, () =>
        {
            RuleFor(x => x.MaxPrice!.Value)
                .GreaterThanOrEqualTo(0).WithMessage("Maximum price cannot be negative");
        });
        
        // Validate price range consistency
        When(x => x.MinPrice.HasValue && x.MaxPrice.HasValue, () =>
        {
            RuleFor(x => x)
                .Must(x => x.MinPrice!.Value <= x.MaxPrice!.Value)
                .WithMessage("Minimum price must be less than or equal to maximum price");
        });
        
        // Validate category (if needed)
        When(x => !string.IsNullOrEmpty(x.Category), () =>
        {
            RuleFor(x => x.Category)
                .MaximumLength(100).WithMessage("Category name cannot exceed 100 characters");
        });
        
        // Validate enum values
        /*RuleFor(x => x.Availability)
            .NotEmpty().WithMessage("Invalid availability filter");
        
        RuleFor(x => x.SortBy)
            .IsInEnum().WithMessage("Invalid sort option");*/
    }
}