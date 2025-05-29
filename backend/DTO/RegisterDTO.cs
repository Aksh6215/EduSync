using System.ComponentModel.DataAnnotations;

namespace backend.DTO
{
    public class RegisterDTO
    {
        [Required]
        public required string Name { get; set; }
        [Required]
        [EmailAddress]
        public required string Email { get; set; }
        [Required]
        public required string Password { get; set; }
        [Required]
        public required string Role { get; set; }
    }
} 