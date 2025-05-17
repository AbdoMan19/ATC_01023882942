using EventBooking.DB.Enums;
using EventBooking.Service.DTOs.Event;
using EventBooking.Service.Services.EventService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace EventBooking.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventController : ControllerBase
{
    private readonly IEventService _eventService;

    public EventController(IEventService eventService)
    {
        _eventService = eventService;
    }

    [HttpPost("filter")]  // Changed from "Events" to "filter" to be more descriptive
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetAllEvents([FromBody] EventFilterDto filter, [FromQuery]int pageNumber = 1, [FromQuery]int pageSize = 10)
    {
        // Provide defaults if filter is null
        filter ??= new EventFilterDto();
        
        var result = await _eventService.GetAllEventsAsync(filter, pageNumber, pageSize);
        return result.ErrorList.Count != 0 ? BadRequest(result) : Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetEventById(Guid id)
    {
        var result = await _eventService.GetEventByIdAsync(id);
        return result.ErrorList.Count != 0 ? NotFound(result) : Ok(result);
    }

    [HttpGet("featured")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFeaturedEvents()
    {
        var result = await _eventService.GetFeatureEvents();
        return result.ErrorList.Count != 0 ? BadRequest(result) : Ok(result);
    }

    [HttpGet("upcoming")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUpcomingEvents()
    {
        var result = await _eventService.GetUpcomingEvents();
        return result.ErrorList.Count != 0 ? BadRequest(result) : Ok(result);
    }

    [HttpGet("big-events")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBigEvents()
    {
        var result = await _eventService.GetBigEvents();
        return result.ErrorList.Count != 0 ? BadRequest(result) : Ok(result);
    }
    
    [Authorize("Admin")]
    [HttpGet("admin/all")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAllEventsForAdmin()
    {
        var result = await _eventService.GetAllEventsForAdminAsync();
        return result.ErrorList.Count != 0 ? BadRequest(result) : Ok(result);
    }

    [Authorize("Admin")]
    [HttpPost("create")]  // Added "create" to distinguish from the filter endpoint
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateEvent([FromBody] CreateEventDto dto)
    {
        var result = await _eventService.CreateEventAsync(dto);
        return result.ErrorList.Count != 0 ? BadRequest(result) : Ok(result);
    }

    [Authorize("Admin")]
    [HttpPut("update/{id:guid}")]  // Added "update/" prefix to avoid conflicts
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateEvent(Guid id, [FromBody] UpdateEventDto dto)
    {
        var result = await _eventService.UpdateEventAsync(id, dto);
        
        if (result.ErrorList.Count != 0)
        {
            if (result.Message == "Event not found")
                return NotFound(result);
            if (result.Message == "Unauthorized")
                return Unauthorized(result);
                
            return BadRequest(result);
        }
        
        return Ok(result);
    }

    [Authorize("Admin")]
    [HttpDelete("delete/{id:guid}")]  // Added "delete/" prefix to avoid conflicts
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteEvent(Guid id)
    {
        var result = await _eventService.DeleteEventAsync(id);
        
        if (result.ErrorList.Count != 0)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }
}

