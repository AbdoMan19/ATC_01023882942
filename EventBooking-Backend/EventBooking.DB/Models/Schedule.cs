namespace EventBooking.DB.Models;

public class Schedule
{
    public Guid Id { get; set; }
    public string Activity { get; set; }
    public string Description { get; set; }
    public DateTime Time { get; set; }
    
    // Relations
    public Guid EventId { get; set; }
    public Event Event { get; set; }
}