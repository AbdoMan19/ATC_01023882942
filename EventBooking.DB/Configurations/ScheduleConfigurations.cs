using EventBooking.DB.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EventBooking.DB.Configurations;

public class ScheduleConfigurations : IEntityTypeConfiguration<Schedule>
{
    public void Configure(EntityTypeBuilder<Schedule> builder)
    {
        // Primary Key
        builder.HasKey(s => s.Id);

        // Properties
        builder.Property(s => s.Activity)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(s => s.Description)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(s => s.Time)
            .IsRequired()
            .HasColumnType("timestamp with time zone");

        // Relationships
        builder.HasOne(s => s.Event)
            .WithMany(e => e.Schedules)
            .HasForeignKey(s => s.EventId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}