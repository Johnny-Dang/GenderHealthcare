using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class addtableAppoinment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Appoiment_Accounts_UserId",
                table: "Appoiment");

            migrationBuilder.DropForeignKey(
                name: "FK_Appoiment_TestService_ServiceId",
                table: "Appoiment");

            migrationBuilder.DropForeignKey(
                name: "FK_TestResult_Appoiment_AppointmentId",
                table: "TestResult");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Appoiment",
                table: "Appoiment");

            migrationBuilder.RenameTable(
                name: "Appoiment",
                newName: "Appoiments");

            migrationBuilder.RenameIndex(
                name: "IX_Appoiment_UserId",
                table: "Appoiments",
                newName: "IX_Appoiments_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_Appoiment_ServiceId",
                table: "Appoiments",
                newName: "IX_Appoiments_ServiceId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Appoiments",
                table: "Appoiments",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Appoiments_Accounts_UserId",
                table: "Appoiments",
                column: "UserId",
                principalTable: "Accounts",
                principalColumn: "User_Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Appoiments_TestService_ServiceId",
                table: "Appoiments",
                column: "ServiceId",
                principalTable: "TestService",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TestResult_Appoiments_AppointmentId",
                table: "TestResult",
                column: "AppointmentId",
                principalTable: "Appoiments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Appoiments_Accounts_UserId",
                table: "Appoiments");

            migrationBuilder.DropForeignKey(
                name: "FK_Appoiments_TestService_ServiceId",
                table: "Appoiments");

            migrationBuilder.DropForeignKey(
                name: "FK_TestResult_Appoiments_AppointmentId",
                table: "TestResult");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Appoiments",
                table: "Appoiments");

            migrationBuilder.RenameTable(
                name: "Appoiments",
                newName: "Appoiment");

            migrationBuilder.RenameIndex(
                name: "IX_Appoiments_UserId",
                table: "Appoiment",
                newName: "IX_Appoiment_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_Appoiments_ServiceId",
                table: "Appoiment",
                newName: "IX_Appoiment_ServiceId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Appoiment",
                table: "Appoiment",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Appoiment_Accounts_UserId",
                table: "Appoiment",
                column: "UserId",
                principalTable: "Accounts",
                principalColumn: "User_Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Appoiment_TestService_ServiceId",
                table: "Appoiment",
                column: "ServiceId",
                principalTable: "TestService",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TestResult_Appoiment_AppointmentId",
                table: "TestResult",
                column: "AppointmentId",
                principalTable: "Appoiment",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
