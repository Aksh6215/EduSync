using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.DTO;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserModelsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserModelsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/UserModels
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserModel>>> GetUserModels()
        {
            return await _context.UserModels.ToListAsync();
        }

        // GET: api/UserModels/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UserModel>> GetUserModel(Guid id)
        {
            var userModel = await _context.UserModels.FindAsync(id);

            if (userModel == null)
            {
                return NotFound();
            }

            return userModel;
        }

        // PUT: api/UserModels/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUserModel(Guid id, UserModelDTO userModel)
        {
            if (id != userModel.UserId)
            {
                return BadRequest();
            }

            UserModel originaluser = new UserModel()
            {
                UserId = userModel.UserId,
                Name = userModel.Name,
                Email = userModel.Email,
                Role = userModel.Role,
                PasswordHash = userModel.PasswordHash
            };

            _context.Entry(originaluser).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserModelExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/UserModels
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<UserModel>> PostUserModel(UserModelDTO userModel)
        {
            UserModel originaluser = new UserModel()
            {
                UserId = userModel.UserId,
                Name = userModel.Name,
                Email = userModel.Email,
                Role = userModel.Role,
                PasswordHash = userModel.PasswordHash
            };
            _context.UserModels.Add(originaluser);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetUserModel", new { id = originaluser.UserId }, originaluser);
        }

        // DELETE: api/UserModels/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUserModel(Guid id)
        {
            var userModel = await _context.UserModels.FindAsync(id);
            if (userModel == null)
            {
                return NotFound();
            }

            _context.UserModels.Remove(userModel);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool UserModelExists(Guid id)
        {
            return _context.UserModels.Any(e => e.UserId == id);
        }
    }
}
