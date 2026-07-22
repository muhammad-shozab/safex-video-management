using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SafeX.Api.Data;

namespace SafeX.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly SafeXDbContext _db;
    public CategoriesController(SafeXDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> All() =>
        Ok(await _db.Categories.OrderBy(c => c.Name).ToListAsync());
}
