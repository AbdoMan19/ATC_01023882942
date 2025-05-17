using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EventBooking.DB.Migrations
{
    /// <inheritdoc />
    public partial class removeUserDeviceIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserDevice_DeviceName_DeviceId",
                table: "UserDevice");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_UserDevice_DeviceName_DeviceId",
                table: "UserDevice",
                columns: new[] { "DeviceName", "DeviceId" },
                unique: true);
        }
    }
}
