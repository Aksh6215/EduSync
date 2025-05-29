using System.ComponentModel.DataAnnotations;

namespace backend.DTO
{
    public class LoginDTO
    {
        [Required]
        [EmailAddress]
        public required string Email { get; set; }
        [Required]
        public required string Password { get; set; }
    }
} 