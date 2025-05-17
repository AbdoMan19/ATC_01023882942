using System;
using System.Collections.Generic;

namespace EventBooking.Service.DTOs.Event;

public class AdminEventDto
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Location { get; set; }
    public int AvailableSeats { get; set; }
    public int TotalSeats { get; set; }
    public decimal Price { get; set; }
    public string ImageUrl { get; set; }
    public string Category { get; set; }
    public List<string> Gallery { get; set; } = new List<string>();
    public DateTime CreatedAt { get; set; }
}