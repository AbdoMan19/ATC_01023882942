namespace EventBooking.DB.Models;

public class Faq
{
    
    public Guid Id { get; set; }
    public string Question { get; set; }
    public string Answer { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Relations
    public Guid EventId { get; set; }
    public Event Event { get; set; }
}