using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TodoApp.DataAccess.Entities;

namespace TodoApp.DataAccess.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Name).IsRequired().HasMaxLength(50);
        builder.Property(c => c.Color).HasMaxLength(20);

        builder.HasOne(c => c.User)
              .WithMany(u => u.Categories)
              .HasForeignKey(c => c.UserId)
              .OnDelete(DeleteBehavior.Cascade);
    }
}
