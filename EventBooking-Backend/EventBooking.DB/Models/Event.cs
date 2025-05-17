using EventBooking.DB.Enums;

namespace EventBooking.DB.Models;

public class Event
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Location { get; set; }
    public int AvailableSeats { get; set; }
    public int TotalSeats { get; set; }
    public int TicketSold => TotalSeats - AvailableSeats;
    
    public decimal Price { get; set; }
    public string ImageUrl { get; set; }
    public EventStatus Status { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Relations
    public Guid OrganizerId { get; set; }
    public User Organizer { get; set; }
    public virtual ICollection<EventCategory> EventCategories { get; set; } = [];
    public virtual ICollection<Booking> Bookings { get; set; } = [];
    public ICollection<string> Gallery { get; set; } = [];
    public virtual ICollection<Review> Reviews { get; set; } = [];
    public virtual ICollection<Faq> Faqs { get; set; } = [];
    public virtual ICollection<Schedule> Schedules { get; set; } = [];
}

