using EventBooking.DB.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EventBooking.DB.Configurations;

public class UserConfigurations : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {

        builder.HasKey(u => u.Id);

        builder.Property(u => u.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(u => u.ImageUrl)
            .IsRequired(false);
        
        builder.Property(u => u.Email)
            .IsRequired();
        builder.Property(u => u.EmailConfirmed)
            .HasDefaultValue(true);

        builder.Property(u => u.PhoneNumber)
            .IsRequired(false)
            .HasMaxLength(20);


        //create at
        builder.Property(u => u.CreatedAt)
            .HasDefaultValueSql("CURRENT_TIMESTAMP");
        //update at
        builder.Property(u => u.UpdatedAt)
            .HasDefaultValueSql("CURRENT_TIMESTAMP")
            .ValueGeneratedOnUpdate();
        
        
        // Relationships
        builder.HasMany(u => u.Bookings)
            .WithOne(b => b.User)
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasMany(u => u.Reviews)
            .WithOne(b => b.User)
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasMany(u => u.CreatedEvents)
            .WithOne(e => e.Organizer)
            .OnDelete(DeleteBehavior.Cascade);
            
            
        //indexes
        builder.HasIndex(u => u.Email)
            .IsUnique();
    }
}