using EventBooking.DB.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EventBooking.DB.Configurations;

public class UserDeviceConfigurations : IEntityTypeConfiguration<UserDevice>
{
    public void Configure(EntityTypeBuilder<UserDevice> builder)
    {
        builder.HasKey(ud => ud.Id);

        builder.Property(ud => ud.DeviceId)
            .IsRequired()
            .HasMaxLength(255); // Increase max length

        builder.Property(ud => ud.DeviceName)
            .IsRequired()
            .HasMaxLength(255); // Increase max length

        builder.Property(ud => ud.DeviceType)
            .IsRequired()
            .HasMaxLength(100); // Increase max length

        builder.Property(ud => ud.Platform)
            .IsRequired()
            .HasMaxLength(100); // Increase max length


        // Relationship with User
        builder.HasOne(ud => ud.User)
            .WithMany(u => u.UserDevices)
            .HasForeignKey(ud => ud.UserId);

        // Relationship with RefreshToken (one-to-one)
        builder.HasOne(ud => ud.RefreshToken)
            .WithOne(rt => rt.UserDevice)
            .HasForeignKey<RefreshToken>(rt => rt.UserDeviceId);
    }
}