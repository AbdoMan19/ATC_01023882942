using EventBooking.DB.Enums;
using System;
using System.Collections.Generic;

namespace EventBooking.Service.DTOs.Event;

public class EventResponseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Location { get; set; }
    public int AvailableSeats { get; set; }
    public int TotalSeats { get; set; }
    public int TicketSold { get; set; }
    public decimal Price { get; set; }
    public string ImageUrl { get; set; }
    public EventStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public OrganizerDto? Organizer { get; set; }
    public string Category { get; set; }
    public List<string> Gallery { get; set; } = new List<string>();
    public List<FaqDto> Faqs { get; set; } = new List<FaqDto>();
    public List<ScheduleDto> Schedules { get; set; } = new List<ScheduleDto>();
}

public class OrganizerDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
}



public class FaqDto
{
    public Guid Id { get; set; }
    public string Question { get; set; }
    public string Answer { get; set; }
}

public class ScheduleDto
{
    public Guid Id { get; set; }
    public string Activity { get; set; }
    public string Description { get; set; }
    public DateTime Time { get; set; }
}