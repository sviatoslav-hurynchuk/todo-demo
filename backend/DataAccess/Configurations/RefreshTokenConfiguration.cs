using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TodoApp.DataAccess.Entities;

namespace TodoApp.DataAccess.Configurations;

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.HasKey(r => r.Id);
        builder.HasIndex(r => r.Token).IsUnique();
        builder.HasIndex(r => r.ExpiresAt);
        builder.HasIndex(r => r.RevokedAt);

        builder.Property(r => r.Token).IsRequired().HasMaxLength(200);
        builder.Property(r => r.CreatedByIp).HasMaxLength(50);
        builder.Property(r => r.RevokedByIp).HasMaxLength(50);

        builder.HasOne(r => r.User)
              .WithMany(u => u.RefreshTokens)
              .HasForeignKey(r => r.UserId)
              .OnDelete(DeleteBehavior.Cascade);
    }
}
