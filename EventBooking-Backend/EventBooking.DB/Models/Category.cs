namespace EventBooking.DB.Models;

public class Category
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    
    // Relations
    public ICollection<EventCategory> EventCategories { get; set; } = [];
}