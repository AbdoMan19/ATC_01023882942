using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using EventBooking.Api.Extensions;
using EventBooking.Service.Common;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.IdentityModel.Tokens;

namespace EventBooking.Api;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services
            .AddWebApiServices(builder.Configuration)
            .AddCustomSwagger();
        
                builder.Services.AddControllers()
                    .ConfigureApiBehaviorOptions(options => options.InvalidModelStateResponseFactory = context => ValidationResult(context))
                    .AddJsonOptions(o =>
                    {
                        o.JsonSerializerOptions.DictionaryKeyPolicy = JsonNamingPolicy.CamelCase;
                        o.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
                        o.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
                    });
                
                builder.Services.AddAuthentication(options =>
                    {
                        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                    })
                    .AddJwtBearer(options =>
                    {
                        options.TokenValidationParameters = new TokenValidationParameters
                        {
                            ValidateIssuer = true,
                            ValidateAudience = true,
                            ValidateIssuerSigningKey = true,
                            ValidIssuer = builder.Configuration["Jwt:Issuer"],
                            ValidAudience = builder.Configuration["Jwt:Audience"],
                            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
                        };
                    });

        var app = builder.Build();

        // Configure the HTTP request pipeline.

        app.UseWebApiMiddleware();

        app.Run();
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