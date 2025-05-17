using EventBooking.DB.Enums;
using EventBooking.Service.Common;
using EventBooking.Service.DTOs.Event;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EventBooking.Service.Services.EventService;

public interface IEventService
{
    Task<GenericResponseModel<EventResponseDto>> CreateEventAsync(CreateEventDto dto);
    Task<GenericResponseModel<EventResponseDto>> GetEventByIdAsync(Guid id);
    Task<GenericResponseModel<List<EventResponseDto>>> GetAllEventsAsync(EventFilterDto? filter ,int pageNumber = 1 , int pageSize = 10 );
    Task<GenericResponseModel<EventResponseDto>> UpdateEventAsync(Guid id, UpdateEventDto dto);
    Task<GenericResponseModel<bool>> DeleteEventAsync(Guid id);
    
    Task<GenericResponseModel<List<EventResponseDto>>> GetFeatureEvents(int page = 1, int pageSize = 10);
    Task<GenericResponseModel<List<EventResponseDto>>> GetUpcomingEvents(int page = 1, int pageSize = 10);
    Task<GenericResponseModel<List<EventResponseDto>>> GetBigEvents(int page = 1, int pageSize = 10);
    Task<GenericResponseModel<List<AdminEventDto>>> GetAllEventsForAdminAsync();
}