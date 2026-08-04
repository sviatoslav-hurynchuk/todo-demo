using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TodoApp.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddTasksCompositeIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Tasks_UserId",
                table: "Tasks");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_UserId_CategoryId_IsImportant_CreatedAt_Id",
                table: "Tasks",
                columns: new[] { "UserId", "CategoryId", "IsImportant", "CreatedAt", "Id" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Tasks_UserId_CategoryId_IsImportant_CreatedAt_Id",
                table: "Tasks");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_UserId",
                table: "Tasks",
                column: "UserId");
        }
    }
}
