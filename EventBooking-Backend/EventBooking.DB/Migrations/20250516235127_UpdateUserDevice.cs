using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EventBooking.DB.Migrations
{
    /// <inheritdoc />
    public partial class UpdateUserDevice : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RefreshToken_UserDevice_UserDeviceId",
                table: "RefreshToken");

            migrationBuilder.DropForeignKey(
                name: "FK_UserDevice_Users_UserId",
                table: "UserDevice");

            migrationBuilder.AlterColumn<string>(
                name: "Platform",
                table: "UserDevice",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "DeviceType",
                table: "UserDevice",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "DeviceName",
                table: "UserDevice",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "DeviceId",
                table: "UserDevice",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AddForeignKey(
                name: "FK_RefreshToken_UserDevice_UserDeviceId",
                table: "RefreshToken",
                column: "UserDeviceId",
                principalTable: "UserDevice",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_UserDevice_Users_UserId",
                table: "UserDevice",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RefreshToken_UserDevice_UserDeviceId",
                table: "RefreshToken");

            migrationBuilder.DropForeignKey(
                name: "FK_UserDevice_Users_UserId",
                table: "UserDevice");

            migrationBuilder.AlterColumn<string>(
                name: "Platform",
                table: "UserDevice",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "DeviceType",
                table: "UserDevice",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "DeviceName",
                table: "UserDevice",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<string>(
                name: "DeviceId",
                table: "UserDevice",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255);

            migrationBuilder.AddForeignKey(
                name: "FK_RefreshToken_UserDevice_UserDeviceId",
                table: "RefreshToken",
                column: "UserDeviceId",
                principalTable: "UserDevice",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserDevice_Users_UserId",
                table: "UserDevice",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
