using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SafeX.Api.Data;
using SafeX.Api.Dtos;
using SafeX.Api.Models;
using SafeX.Api.Services;

namespace SafeX.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VideosController : ControllerBase
{
    private readonly SafeXDbContext _db;
    private readonly YouTubeService _yt;

    public VideosController(SafeXDbContext db, YouTubeService yt)
    {
        _db = db; _yt = yt;
    }

    // GET /api/videos?status=Pending&includeDeleted=false
    [HttpGet]
    public async Task<IActionResult> List(string? status, bool includeDeleted = false)
    {
        var q = _db.Videos.Include(v => v.Category).AsQueryable();
        if (!includeDeleted) q = q.Where(v => !v.IsDeleted);
        else q = q.Where(v => v.IsDeleted);
        if (!string.IsNullOrWhiteSpace(status)) q = q.Where(v => v.Status == status);
        return Ok(await q.OrderByDescending(v => v.UpdatedAt).ToListAsync());
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var v = await _db.Videos.Include(x => x.Category).FirstOrDefaultAsync(x => x.Id == id);
        return v is null ? NotFound() : Ok(v);
    }

    // GET /api/videos/search?q=kids+science
    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q)) return BadRequest("query required");
        try { return Ok(await _yt.SearchAsync(q)); }
        catch (Exception ex) { return StatusCode(500, ex.Message); }
    }

    // POST /api/videos/import  { youTubeId }
    [HttpPost("import")]
    public async Task<IActionResult> Import([FromBody] ImportRequest req)
    {
        if (await _db.Videos.AnyAsync(v => v.YouTubeId == req.YouTubeId))
            return Conflict("Already imported");

        var d = await _yt.GetDetailsAsync(req.YouTubeId);
        if (d is null) return NotFound("Video not found on YouTube");

        var v = new Video {
            YouTubeId = d.YouTubeId, Title = d.Title, Description = d.Description,
            ChannelTitle = d.ChannelTitle, ThumbnailUrl = d.ThumbnailUrl,
            DurationSeconds = d.DurationSeconds, ViewCount = d.ViewCount,
            Status = "Pending", Audience = "general",
            CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
        };
        _db.Videos.Add(v);
        await _db.SaveChangesAsync();
        return Ok(v);
    }

    [HttpPost("{id:int}/review")]
    public async Task<IActionResult> Review(int id, [FromBody] ReviewRequest req)
    {
        var v = await _db.Videos.FindAsync(id);
        if (v is null) return NotFound();
        v.ReviewNotes = req.ReviewNotes;
        v.Status = req.Status; // Approved | Rejected
        v.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(v);
    }

    [HttpPost("{id:int}/publish")]
    public async Task<IActionResult> Publish(int id, [FromBody] PublishRequest req)
    {
        var v = await _db.Videos.FindAsync(id);
        if (v is null) return NotFound();
        v.Audience = req.Audience;
        v.CategoryId = req.CategoryId;
        v.Status = "Published";
        v.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(v);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Edit(int id, [FromBody] EditRequest req)
    {
        var v = await _db.Videos.FindAsync(id);
        if (v is null) return NotFound();
        v.Title = req.Title;
        v.Description = req.Description;
        v.ThumbnailUrl = req.ThumbnailUrl;
        v.CategoryId = req.CategoryId;
        v.Language = req.Language;
        v.Audience = req.Audience;
        v.Status = req.Status;
        v.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(v);
    }

    // Soft delete
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> SoftDelete(int id)
    {
        var v = await _db.Videos.FindAsync(id);
        if (v is null) return NotFound();
        v.IsDeleted = true; v.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id:int}/restore")]
    public async Task<IActionResult> Restore(int id)
    {
        var v = await _db.Videos.FindAsync(id);
        if (v is null) return NotFound();
        v.IsDeleted = false; v.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(v);
    }

    [HttpDelete("{id:int}/permanent")]
    public async Task<IActionResult> HardDelete(int id)
    {
        var v = await _db.Videos.FindAsync(id);
        if (v is null) return NotFound();
        _db.Videos.Remove(v);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
