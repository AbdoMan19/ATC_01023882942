using System.Reflection;


namespace EventBooking.DB;

public class EventBookingContext : DbContext
{
	public OnCareEmergencyCardContext(DbContextOptions<OnCareEmergencyCardContext> options)
		: base(options)
	{
	}

	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		base.OnModelCreating(modelBuilder);

		modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
	}
}
