using EventBooking.DB.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EventBooking.DB.Configurations;

public class BookingConfigurations : IEntityTypeConfiguration<Booking>
{
    public void Configure(EntityTypeBuilder<Booking> builder)
    {
        // Primary Key
        builder.HasKey(b => b.Id);
        
        // Properties
        builder.Property(b => b.TotalPrice)
            .HasPrecision(18, 2);
            
        builder.Property(b => b.CreateAt)
            .HasDefaultValueSql("CURRENT_TIMESTAMP");
        builder.Property(b => b.Status)
            .HasConversion<string>()
            .HasMaxLength(50);
        builder.Property(b => b.NumberOfTickets)
            .IsRequired();
    
        
        
        
            
        // Relationships
        builder.HasOne(b => b.Event)
            .WithMany(e => e.Bookings)
            .HasForeignKey(b => b.EventId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasOne(b => b.User)
            .WithMany(e => e.Bookings)
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Restrict);
        
    }
}