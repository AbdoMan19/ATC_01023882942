using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;
using EventBooking.Api.Handlers;
using EventBooking.DB;
using EventBooking.DB.Models;
using EventBooking.Service.Common;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scrutor;


namespace EventBooking.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddWebApiServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddControllers()
            .ConfigureApiBehaviorOptions(options => options.InvalidModelStateResponseFactory = context => ValidationResult(context))
            .AddJsonOptions(o =>
            {
                o.JsonSerializerOptions.DictionaryKeyPolicy = JsonNamingPolicy.CamelCase;
                o.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
                o.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
                //enums
                o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
            });
        
        
        services.AddFluentValidationAutoValidation(config =>
        {
            config.DisableDataAnnotationsValidation = true;
        });
        services.AddFluentValidationClientsideAdapters();
        services.AddValidatorsFromAssembly(EventBooking.Service.AssemblyReference.Assembly, includeInternalTypes: true);
        

        services.Scan(selector => selector
            .FromAssemblies(
                EventBooking.Service.AssemblyReference.Assembly,
                EventBooking.Repository.AssemblyReference.Assembly,
                EventBooking.UnitOfWork.AssemblyReference.Assembly)
            .AddClasses()
            .UsingRegistrationStrategy(RegistrationStrategy.Skip)
            .AsImplementedInterfaces()
            .WithScopedLifetime());
        
        
        services.AddDbContext<EventBookingContext>(options =>
        {
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                npgsqlOptions =>
                {
                    npgsqlOptions.EnableRetryOnFailure(3);
                    npgsqlOptions.CommandTimeout(30);
                });
        });
        
        

        services.AddIdentity<User, IdentityRole<Guid>>(options =>
            {
                options.Password.RequireDigit = true;
                options.Password.RequiredLength = 8;
                options.Password.RequireLowercase = true;
                options.Password.RequireUppercase = true;
                options.Password.RequireNonAlphanumeric = true;
                options.User.RequireUniqueEmail = false;
                options.SignIn.RequireConfirmedEmail = false;
                options.SignIn.RequireConfirmedPhoneNumber = false;
                options.Lockout.MaxFailedAccessAttempts = 3;
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromSeconds(10);
            })
            .AddEntityFrameworkStores<EventBookingContext>();

        services.AddCors(options =>
        {
            options.AddPolicy("DefaultPolicy", policy =>
            {
                policy.AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader();
            });
        });



        services.AddExceptionHandler<GlobalExceptionHandler>();
        services.AddHttpContextAccessor();

        services.AddEndpointsApiExplorer();

        services.AddAuthorization(options =>
        {
            options.AddPolicy("Admin", policy => policy.RequireRole("ADMIN"));
            
            options.AddPolicy("User", policy => policy.RequireRole("USER"));
            
        });

        services.AddProblemDetails();

        return services;
    }
    static BadRequestObjectResult ValidationResult(ActionContext context)
    {
        var errorList = context.ModelState
            .Where(state => state.Value.ValidationState == ModelValidationState.Invalid)
            .SelectMany(
                state => state.Value.Errors,
                (state, error) => new ErrorResponseModel
                {
                    PropertyName = state.Key,
                    Message = error.ErrorMessage,
                })
            .ToList();

        return new BadRequestObjectResult(GenericResponseModel<bool>.Failure("Validation Error", errorList));
    }
   


}
