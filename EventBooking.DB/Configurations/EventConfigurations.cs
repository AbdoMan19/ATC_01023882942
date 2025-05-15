using EventBooking.DB.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EventBooking.DB.Configurations;

public class EventConfigurations : IEntityTypeConfiguration<Event>
{
    public void Configure(EntityTypeBuilder<Event> builder)
    {
        // Primary Key
        builder.HasKey(e => e.Id);
        
        // Properties
        builder.Property(e => e.Title)
            .IsRequired()
            .HasMaxLength(200);
            
        builder.Property(e => e.Description)
            .IsRequired()
            .HasMaxLength(2000);
            
        builder.Property(e => e.Location)
            .IsRequired()
            .HasMaxLength(500);
            
        builder.Property(e => e.Price)
            .HasPrecision(18, 2);
            
        builder.Property(e => e.ImageUrl)
            .HasMaxLength(2000);
            
        builder.Property(e => e.CreatedAt)
            .HasDefaultValueSql("CURRENT_TIMESTAMP");
        
            
        // Relationships
        builder.HasOne(e => e.Organizer)
            .WithMany(u => u.CreatedEvents)
            .HasForeignKey(e => e.OrganizerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(e => e.EventCategories)
            .WithOne(ec => ec.Event)
            .HasForeignKey(ec => ec.EventId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasMany(e => e.Bookings)
            .WithOne(b => b.Event)
            .HasForeignKey(b => b.EventId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasMany(e => e.Schedules)
            .WithOne(s => s.Event)
            .HasForeignKey(s => s.EventId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(e => e.Reviews)
            .WithOne(r => r.Event)
            .HasForeignKey(r => r.EventId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}