using System.Reflection;
using EventBooking.DB.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;


namespace EventBooking.DB;

public class EventBookingContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>
{
	public EventBookingContext(DbContextOptions<EventBookingContext> options)
		: base(options)
	{
	}

	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		base.OnModelCreating(modelBuilder);
		modelBuilder.Entity<IdentityUserRole<Guid>>().ToTable("UserRoles");
		modelBuilder.Entity<IdentityUserClaim<Guid>>().ToTable("UserClaims");
		modelBuilder.Entity<IdentityUserLogin<Guid>>().ToTable("UserLogins");
		modelBuilder.Entity<IdentityRoleClaim<Guid>>().ToTable("RoleClaims");
		modelBuilder.Entity<IdentityUserToken<Guid>>().ToTable("UserTokens");
		modelBuilder.Entity<User>().ToTable("Users");
		modelBuilder.Entity<IdentityRole<Guid>>().ToTable("Roles");

		modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
	}
}
