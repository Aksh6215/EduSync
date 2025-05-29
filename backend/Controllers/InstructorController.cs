using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using backend.DTO;
using System.ComponentModel.DataAnnotations;

namespace backend.Controllers
{
    [Route("api/instructor")]
    [ApiController]
    [Authorize(Roles = "Instructor")]
    public class InstructorController : ControllerBase
    {
        private readonly AppDbContext _context;

        public InstructorController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/instructor/courses
        [HttpGet("courses")]
        public async Task<ActionResult<IEnumerable<Course>>> GetCoursesByAuthenticatedInstructor()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out Guid instructorId))
            {
                return Unauthorized("Invalid instructor credentials.");
            }

            var courses = await _context.Courses
                                        .Where(c => c.InstructorId == instructorId)
                                        .ToListAsync();

            if (courses == null || courses.Count == 0)
            {
                return NotFound("No courses found for this instructor.");
            }

            return Ok(courses);
        }

        // GET: api/instructor/courses/{id}
        [HttpGet("courses/{id}")]
        public async Task<ActionResult<Course>> GetCourse(Guid id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out Guid instructorId))
            {
                return Unauthorized("Invalid instructor credentials.");
            }

            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.CourseId == id && c.InstructorId == instructorId);

            if (course == null)
            {
                return NotFound("Course not found or you don't have access to it.");
            }

            return course;
        }

        // POST: api/instructor/courses
        [HttpPost("courses")]
        public async Task<ActionResult<Course>> AddCourseByInstructor([FromBody] CourseDTO courseDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out Guid instructorId))
            {
                return Unauthorized("Invalid instructor credentials.");
            }

            if (string.IsNullOrWhiteSpace(courseDto.Title))
            {
                return BadRequest("Title is required.");
            }

            if (string.IsNullOrWhiteSpace(courseDto.Description))
            {
                return BadRequest("Description is required.");
            }

            var course = new Course
            {
                CourseId = Guid.NewGuid(),
                Title = courseDto.Title,
                Description = courseDto.Description,
                MediaUrl = courseDto.MediaUrl,
                InstructorId = instructorId
            };

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCourse), new { id = course.CourseId }, course);
        }
    }
}
