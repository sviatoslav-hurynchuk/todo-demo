using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TodoApp.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class DueDateToDateOnly : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Normalize existing DueDate values from DateTime format (yyyy-MM-dd HH:mm:ss.FFFFFFF)
            // to DateOnly format (yyyy-MM-dd). NULL values are preserved.
            // Invalid values that cannot be parsed by SQLite's date() function are set to NULL
            // rather than left in a state that would cause a runtime FormatException on read.
            migrationBuilder.Sql(@"
                UPDATE Tasks
                SET DueDate = date(DueDate)
                WHERE DueDate IS NOT NULL
                  AND date(DueDate) IS NOT NULL;

                UPDATE Tasks
                SET DueDate = NULL
                WHERE DueDate IS NOT NULL
                  AND date(DueDate) IS NULL;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Re-expand date-only values back to a DateTime-compatible text format.
            // NULL values are preserved.
            migrationBuilder.Sql(@"
                UPDATE Tasks
                SET DueDate = DueDate || 'T00:00:00'
                WHERE DueDate IS NOT NULL;
            ");
        }
    }
}
