namespace SafeX.Api.Dtos;

public record YouTubeSearchItem(
    string YouTubeId,
    string Title,
    string Description,
    string ChannelTitle,
    string ThumbnailUrl,
    int DurationSeconds,
    long ViewCount);

public record ImportRequest(string YouTubeId);

public record ReviewRequest(string ReviewNotes, string Status); // Approved | Rejected

public record PublishRequest(string Audience, int CategoryId);  // kids | general

public record EditRequest(
    string Title,
    string? Description,
    string? ThumbnailUrl,
    int? CategoryId,
    string? Language,
    string Audience,
    string Status);
