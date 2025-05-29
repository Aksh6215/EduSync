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
using System.Security.Claims;
using System.IO;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CoursesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CoursesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Courses
        [HttpGet]
        // Allow anonymous access to see all courses for students and unauthenticated users
        // Only filter for instructors
        public async Task<ActionResult<IEnumerable<CourseDTO>>> GetCourses()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            var userRoleClaim = User.FindFirst(ClaimTypes.Role);

            IQueryable<Course> query;
            if (userIdClaim != null && userRoleClaim != null && userRoleClaim.Value.ToLower() == "instructor")
            {
                // Return only courses for this instructor
                var userId = Guid.Parse(userIdClaim.Value);
                query = _context.Courses.Where(c => c.InstructorId == userId);
            }
            else
            {
                // Return all courses for students and unauthenticated users
                query = _context.Courses;
            }

            var courses = await query.ToListAsync();
            var courseDtos = courses.Select(c => new CourseDTO {
                CourseId = c.CourseId,
                Title = c.Title,
                Description = c.Description,
                InstructorId = c.InstructorId,
                MediaUrl = c.MediaUrl
            }).ToList();
            return Ok(courseDtos);
        }

        // GET: api/Courses/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Course>> GetCourse(Guid id)
        {
            var course = await _context.Courses.FindAsync(id);

            if (course == null)
            {
                return NotFound();
            }

            return course;
        }

        // PUT: api/Courses/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCourse(Guid id, [FromForm] CourseDTO course, [FromForm] IFormFile file)
        {
            if (id != course.CourseId)
                return BadRequest();

            var originalCourse = await _context.Courses.FindAsync(id);
            if (originalCourse == null)
                return NotFound();

            originalCourse.Title = course.Title;
            originalCourse.Description = course.Description;

            // Handle new file upload
            if (file != null && file.Length > 0)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                originalCourse.MediaUrl = $"/uploads/{uniqueFileName}";
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // POST: api/Courses
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Course>> PostCourse([FromForm] CourseDTO course, [FromForm] IFormFile file)
        {
            // Save the uploaded file if present
            string mediaUrl = null;
            if (file != null && file.Length > 0)
            {
                // Choose a directory to save files (e.g., wwwroot/uploads)
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Set the media URL (relative path for client access)
                mediaUrl = $"/uploads/{uniqueFileName}";
            }

            Course originalCourse = new Course()
            {
                CourseId = Guid.NewGuid(),
                Title = course.Title,
                Description = course.Description,
                InstructorId = course.InstructorId,
                MediaUrl = mediaUrl
            };
            _context.Courses.Add(originalCourse);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetCourse", new { id = originalCourse.CourseId }, originalCourse);
        }

        // DELETE: api/Courses/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCourse(Guid id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
            {
                return NotFound();
            }

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CourseExists(Guid id)
        {
            return _context.Courses.Any(e => e.CourseId == id);
        }
    }
}
