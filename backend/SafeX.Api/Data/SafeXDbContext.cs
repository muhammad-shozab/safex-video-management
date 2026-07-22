using Microsoft.EntityFrameworkCore;
using SafeX.Api.Models;

namespace SafeX.Api.Data;

public class SafeXDbContext : DbContext
{
    public SafeXDbContext(DbContextOptions<SafeXDbContext> options) : base(options) { }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Video> Videos => Set<Video>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<Category>().HasIndex(c => c.Slug).IsUnique();
        mb.Entity<Video>().HasIndex(v => v.YouTubeId).IsUnique();
    }
}
