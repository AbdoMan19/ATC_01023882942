using System;
using System.Collections.Generic;

namespace EventBooking.Service.DTOs.Event;

public class EventFilterDto
{
    
    // Category filters
    public string? Category { get; set; }
    
    // Price range
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    
    // Availability filters
    public AvailabilityFilter Availability { get; set; } = AvailabilityFilter.All;
    
    // Sorting options
    public SortBy SortBy { get; set; } = SortBy.Date;
    public bool Ascending { get; set; } = false;
}

public enum AvailabilityFilter
{
    All,
    Available,
    AlmostFull
}

public enum SortBy
{
    Date,
    Price,
    Name
}