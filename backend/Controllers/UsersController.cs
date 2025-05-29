using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/users/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(string id)
        {
            if (!Guid.TryParse(id, out var guid))
                return BadRequest("Invalid user ID format.");

            var user = await _context.UserModels.FindAsync(guid);
            if (user == null)
                return NotFound();

            return Ok(new
            {
                id = user.UserId,
                name = user.Name,
                email = user.Email
            });
        }
    }
} 