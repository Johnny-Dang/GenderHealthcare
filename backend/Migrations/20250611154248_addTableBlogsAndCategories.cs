using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class addTableBlogsAndCategories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TestResult_Accounts_StaffId",
                table: "TestResult");

            migrationBuilder.DropForeignKey(
                name: "FK_TestResult_Appoiment_AppointmentId",
                table: "TestResult");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TestResult",
                table: "TestResult");

            migrationBuilder.RenameTable(
                name: "TestResult",
                newName: "TestResults");

            migrationBuilder.RenameIndex(
                name: "IX_TestResult_StaffId",
                table: "TestResults",
                newName: "IX_TestResults_StaffId");

            migrationBuilder.RenameIndex(
                name: "IX_TestResult_AppointmentId",
                table: "TestResults",
                newName: "IX_TestResults_AppointmentId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TestResults",
                table: "TestResults",
                column: "ResultId");

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    CategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.CategoryId);
                });

            migrationBuilder.CreateTable(
                name: "Blogs",
                columns: table => new
                {
                    BlogId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Excerpt = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    AuthorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FeaturedImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsPublished = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Blogs", x => x.BlogId);
                    table.ForeignKey(
                        name: "FK_Blogs_Accounts_AuthorId",
                        column: x => x.AuthorId,
                        principalTable: "Accounts",
                        principalColumn: "User_Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Blogs_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "CategoryId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Blogs_AuthorId",
                table: "Blogs",
                column: "AuthorId");

            migrationBuilder.CreateIndex(
                name: "IX_Blogs_CategoryId",
                table: "Blogs",
                column: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_TestResults_Accounts_StaffId",
                table: "TestResults",
                column: "StaffId",
                principalTable: "Accounts",
                principalColumn: "User_Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TestResults_Appoiment_AppointmentId",
                table: "TestResults",
                column: "AppointmentId",
                principalTable: "Appoiment",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TestResults_Accounts_StaffId",
                table: "TestResults");

            migrationBuilder.DropForeignKey(
                name: "FK_TestResults_Appoiment_AppointmentId",
                table: "TestResults");

            migrationBuilder.DropTable(
                name: "Blogs");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TestResults",
                table: "TestResults");

            migrationBuilder.RenameTable(
                name: "TestResults",
                newName: "TestResult");

            migrationBuilder.RenameIndex(
                name: "IX_TestResults_StaffId",
                table: "TestResult",
                newName: "IX_TestResult_StaffId");

            migrationBuilder.RenameIndex(
                name: "IX_TestResults_AppointmentId",
                table: "TestResult",
                newName: "IX_TestResult_AppointmentId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TestResult",
                table: "TestResult",
                column: "ResultId");

            migrationBuilder.AddForeignKey(
                name: "FK_TestResult_Accounts_StaffId",
                table: "TestResult",
                column: "StaffId",
                principalTable: "Accounts",
                principalColumn: "User_Id",
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
