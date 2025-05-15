using Microsoft.AspNetCore.Identity;

namespace EventBooking.DB.Models;

public class User : IdentityUser<Guid>
{  
    public string Name { get; set; }
    public string? PhoneNumber { get; set; }


    //create at
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    //update at
    public DateTime? UpdatedAt { get; set; }
    public virtual ICollection<UserDevice> UserDevices { get; set; } = [];
    public virtual ICollection<Booking> Bookings { get; set; } = [];
    public virtual ICollection<Review> Reviews { get; set; } = [];
    public virtual ICollection<Event> CreatedEvents { get; set; } = [];
}
