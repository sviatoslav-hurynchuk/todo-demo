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
            // Invalid calendar dates (e.g., Feb 30, 2025-02-29) or unparseable text values
            // are explicitly set to NULL to prevent runtime FormatException on materialization.
            migrationBuilder.Sql(@"
                UPDATE Tasks
                SET DueDate = CASE
                    WHEN date(DueDate, '+0 days') IS NOT NULL AND date(DueDate, '+0 days') = substr(DueDate, 1, 10)
                    THEN date(DueDate)
                    ELSE NULL
                END
                WHERE DueDate IS NOT NULL;
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
