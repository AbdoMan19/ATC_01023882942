

using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

namespace EventBooking.Service.Utilities;
public static class EnvironmentsChecker
{
	public static bool IsInDevelopmentMode(IWebHostEnvironment webHostEnvironment)
		=> webHostEnvironment.IsDevelopment()
		|| webHostEnvironment.IsStaging();
}
