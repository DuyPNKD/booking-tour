using BookingTourAPI.Data;
using BookingTourAPI.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookingTourAPI.Controllers
{
    [ApiController]
    [Route("navbar-menu")]
    public class NavbarController : ControllerBase
    {
        private readonly BookingTourContext _context;

        public NavbarController(BookingTourContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetNavbarMenu()
        {
            try
            {
                // Lấy tất cả region kèm subregion và location qua Include (Left Join tự động)
                var regions = await _context.Regions
                    .Include(r => r.Subregions)
                        .ThenInclude(sr => sr.Locations)
                    .OrderBy(r => r.Id)
                    .ToListAsync();

                var result = new NavbarMenuDto();

                foreach (var region in regions)
                {
                    var regionDto = new NavbarRegionDto
                    {
                        Id = region.Id,
                        Name = region.Name,
                        DisplayName = region.DisplayName
                    };

                    foreach (var subregion in region.Subregions.OrderBy(sr => sr.Id))
                    {
                        var destinationDto = new NavbarDestinationDto
                        {
                            Id = subregion.Id,
                            Group = subregion.Name
                        };

                        foreach (var location in subregion.Locations.OrderBy(l => l.Id))
                        {
                            destinationDto.Places.Add(new NavbarPlaceDto
                            {
                                Id = location.Id,
                                Name = location.Name
                            });
                        }

                        regionDto.Destinations.Add(destinationDto);
                    }

                    // Phân loại vào menu Trong nước (Domestic) hoặc Nước ngoài (International)
                    // Dựa vào logic gốc: Name hoặc DisplayName chứa "Miền" hoặc bắt đầu bằng "Tour Miền" thì là trong nước
                    var isDomestic = (region.DisplayName != null && (region.DisplayName.StartsWith("Tour Miền") || region.DisplayName.Contains("Miền"))) 
                                     || (region.Name != null && region.Name.Contains("Miền"));

                    if (isDomestic)
                    {
                        result.Domestic.Add(regionDto);
                    }
                    else
                    {
                        result.International.Add(regionDto);
                    }
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[NAVBAR ERROR] {ex.ToString()}");
                return StatusCode(500, new { message = "Lỗi server khi lấy navbar" });
            }
        }
    }
}
