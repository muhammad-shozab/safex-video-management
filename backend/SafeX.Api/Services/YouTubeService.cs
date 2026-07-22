using System.Text.Json;
using System.Xml;
using SafeX.Api.Dtos;

namespace SafeX.Api.Services;

public class YouTubeService
{
    private readonly HttpClient _http;
    private readonly string _apiKey;

    public YouTubeService(HttpClient http, IConfiguration cfg)
    {
        _http = http;
        _apiKey = cfg["YouTube:ApiKey"] ?? "";
    }

    public async Task<List<YouTubeSearchItem>> SearchAsync(string query, int maxResults = 12)
    {
        if (string.IsNullOrWhiteSpace(_apiKey) || _apiKey.StartsWith("PASTE_"))
            throw new InvalidOperationException("YouTube API key not configured in appsettings.json");

        // 1. search.list
        var searchUrl = $"https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults={maxResults}&q={Uri.EscapeDataString(query)}&key={_apiKey}";
        using var sDoc = JsonDocument.Parse(await _http.GetStringAsync(searchUrl));
        var ids = sDoc.RootElement.GetProperty("items")
            .EnumerateArray()
            .Select(i => i.GetProperty("id").GetProperty("videoId").GetString()!)
            .ToList();

        if (ids.Count == 0) return new();

        // 2. videos.list for stats + duration
        var videosUrl = $"https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id={string.Join(",", ids)}&key={_apiKey}";
        using var vDoc = JsonDocument.Parse(await _http.GetStringAsync(videosUrl));

        var result = new List<YouTubeSearchItem>();
        foreach (var item in vDoc.RootElement.GetProperty("items").EnumerateArray())
        {
            var sn = item.GetProperty("snippet");
            var cd = item.GetProperty("contentDetails");
            var st = item.TryGetProperty("statistics", out var s) ? s : default;
            var thumb = sn.GetProperty("thumbnails");
            string thumbUrl = thumb.TryGetProperty("high", out var h) ? h.GetProperty("url").GetString()! :
                              thumb.GetProperty("default").GetProperty("url").GetString()!;

            result.Add(new YouTubeSearchItem(
                item.GetProperty("id").GetString()!,
                sn.GetProperty("title").GetString() ?? "",
                sn.GetProperty("description").GetString() ?? "",
                sn.GetProperty("channelTitle").GetString() ?? "",
                thumbUrl,
                ParseIsoDuration(cd.GetProperty("duration").GetString() ?? "PT0S"),
                st.ValueKind == JsonValueKind.Object && st.TryGetProperty("viewCount", out var vc)
                    ? long.Parse(vc.GetString() ?? "0") : 0
            ));
        }
        return result;
    }

    public async Task<YouTubeSearchItem?> GetDetailsAsync(string youtubeId)
    {
        var url = $"https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id={youtubeId}&key={_apiKey}";
        using var doc = JsonDocument.Parse(await _http.GetStringAsync(url));
        var items = doc.RootElement.GetProperty("items");
        if (items.GetArrayLength() == 0) return null;
        var item = items[0];
        var sn = item.GetProperty("snippet");
        var cd = item.GetProperty("contentDetails");
        var st = item.GetProperty("statistics");
        var thumb = sn.GetProperty("thumbnails");
        string thumbUrl = thumb.TryGetProperty("high", out var h) ? h.GetProperty("url").GetString()! :
                          thumb.GetProperty("default").GetProperty("url").GetString()!;
        return new YouTubeSearchItem(
            youtubeId,
            sn.GetProperty("title").GetString() ?? "",
            sn.GetProperty("description").GetString() ?? "",
            sn.GetProperty("channelTitle").GetString() ?? "",
            thumbUrl,
            ParseIsoDuration(cd.GetProperty("duration").GetString() ?? "PT0S"),
            st.TryGetProperty("viewCount", out var vc) ? long.Parse(vc.GetString() ?? "0") : 0
        );
    }

    private static int ParseIsoDuration(string iso)
    {
        try { return (int)XmlConvert.ToTimeSpan(iso).TotalSeconds; }
        catch { return 0; }
    }
}
