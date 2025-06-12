using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class updatetabletestResult_v2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TestResult_Accounts_StaffUser_Id",
                table: "TestResult");

            migrationBuilder.DropIndex(
                name: "IX_TestResult_StaffUser_Id",
                table: "TestResult");

            migrationBuilder.DropColumn(
                name: "StaffUser_Id",
                table: "TestResult");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "StaffUser_Id",
                table: "TestResult",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_TestResult_StaffUser_Id",
                table: "TestResult",
                column: "StaffUser_Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TestResult_Accounts_StaffUser_Id",
                table: "TestResult",
                column: "StaffUser_Id",
                principalTable: "Accounts",
                principalColumn: "User_Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
