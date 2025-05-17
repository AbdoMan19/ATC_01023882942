using EventBooking.DB.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EventBooking.DB.Configurations;

public class FaqConfigurations : IEntityTypeConfiguration<Faq>
{
    public void Configure(EntityTypeBuilder<Faq> builder)
    {
        // Primary Key
        builder.HasKey(f => f.Id);

        // Properties
        builder.Property(f => f.Question)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(f => f.Answer)
            .IsRequired()
            .HasMaxLength(1000);

        // Relationships
        builder.HasOne(f => f.Event)
            .WithMany(e => e.Faqs)
            .HasForeignKey(f => f.EventId)
            .OnDelete(DeleteBehavior.Cascade);
        
    }
}