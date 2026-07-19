using Microsoft.EntityFrameworkCore;
using BookingTourAPI.Models;

namespace BookingTourAPI.Data
{
    public class BookingTourContext : DbContext
    {
        public BookingTourContext(DbContextOptions<BookingTourContext> options) : base(options) { }

        public DbSet<Tour> Tours { get; set; }
        public DbSet<Location> Locations { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<UserVerification> UserVerifications { get; set; }
        public DbSet<Region> Regions { get; set; }
        public DbSet<Subregion> Subregions { get; set; }
        public DbSet<TourImage> TourImages { get; set; }
        public DbSet<TourDeparture> TourDepartures { get; set; }
        public DbSet<TourSchedule> TourSchedules { get; set; }
        public DbSet<TourPrice> TourPrices { get; set; }
        public DbSet<TourTerm> TourTerms { get; set; }
        public DbSet<TourReview> TourReviews { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<BookingDetail> BookingDetails { get; set; }
        public DbSet<Blog> Blogs { get; set; }
        public DbSet<Topic> Topics { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<PasswordReset> PasswordResets { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Tour>()
                .HasIndex(t => t.Slug)
                .IsUnique();

            // Ignore mapping enum status directly to avoid string translation complexity in first setup
            // Status is mapped as string
        }
    }
}
