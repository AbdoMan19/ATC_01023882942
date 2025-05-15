using EventBooking.DB.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EventBooking.DB.Configurations;

public class CategoryConfigurations : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        // Primary Key
        builder.HasKey(c => c.Id);
        
        // Properties
        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(c => c.Description)
            .HasMaxLength(500);
            
        // Relationships
        builder.HasMany(c => c.EventCategories)
            .WithOne(ec => ec.Category)
            .HasForeignKey(ec => ec.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}