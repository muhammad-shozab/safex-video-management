namespace SafeX.Api.Models;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Slug { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}

public class Video
{
    public int Id { get; set; }
    public string YouTubeId { get; set; } = "";
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public string? ChannelTitle { get; set; }
    public string? ThumbnailUrl { get; set; }
    public int DurationSeconds { get; set; }
    public long ViewCount { get; set; }
    public string? Language { get; set; }
    public string Audience { get; set; } = "general";  // "kids" | "general"
    public string Status { get; set; } = "Pending";    // Pending | Approved | Published | Rejected
    public int? CategoryId { get; set; }
    public Category? Category { get; set; }
    public bool IsDeleted { get; set; }
    public string? ReviewNotes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
