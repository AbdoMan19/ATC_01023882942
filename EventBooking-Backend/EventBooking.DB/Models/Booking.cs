using EventBooking.DB.Enums;

namespace EventBooking.DB.Models;

public class Booking
{
    public Guid Id { get; set; }
    public int NumberOfTickets { get; set; }
    public decimal TotalPrice { get; set; }
    public BookingStatus Status { get; set; }
    public DateTime CreateAt { get; set; }
    
    
    // Relations
    public Guid EventId { get; set; }
    public Event Event { get; set; }
    
    public Guid UserId { get; set; }
    public User User { get; set; }
}