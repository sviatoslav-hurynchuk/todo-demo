using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TodoApp.DataAccess.Entities;

namespace TodoApp.DataAccess.Configurations;

public class TaskItemConfiguration : IEntityTypeConfiguration<TaskItem>
{
    public void Configure(EntityTypeBuilder<TaskItem> builder)
    {
        builder.HasKey(t => t.Id);
        
        builder.Property(t => t.Title).IsRequired().HasMaxLength(255);

        builder.HasOne(t => t.User)
              .WithMany(u => u.Tasks)
              .HasForeignKey(t => t.UserId)
              .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(t => t.Category)
              .WithMany(c => c.Tasks)
              .HasForeignKey(t => t.CategoryId)
              .OnDelete(DeleteBehavior.SetNull);
    }
}
