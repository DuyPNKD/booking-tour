using System.Collections.Generic;

namespace BookingTourAPI.DTOs
{
    public class NavbarPlaceDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
    }

    public class NavbarDestinationDto
    {
        public int Id { get; set; }
        public string Group { get; set; } = null!;
        public List<NavbarPlaceDto> Places { get; set; } = new List<NavbarPlaceDto>();
    }

    public class NavbarRegionDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? DisplayName { get; set; }
        public List<NavbarDestinationDto> Destinations { get; set; } = new List<NavbarDestinationDto>();
    }

    public class NavbarMenuDto
    {
        public List<NavbarRegionDto> Domestic { get; set; } = new List<NavbarRegionDto>();
        public List<NavbarRegionDto> International { get; set; } = new List<NavbarRegionDto>();
    }
}
