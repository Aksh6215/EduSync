
using Microsoft.AspNetCore.Mvc;

namespace EduSync.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PingController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get() => Ok("Backend is connected!");
    }
}
