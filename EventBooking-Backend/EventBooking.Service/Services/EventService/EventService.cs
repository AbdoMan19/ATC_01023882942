using EventBooking.DB.Enums;
using EventBooking.DB.Models;
using EventBooking.Service.Common;
using EventBooking.Service.DTOs.Event;
using EventBooking.Service.Services.TokenService;
using EventBooking.UnitOfWork;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EventBooking.Service.Services.EventService;

public class EventService : IEventService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITokenService _tokenService;
    private readonly ILogger<EventService> _logger;

    public EventService(
        IUnitOfWork unitOfWork,
        ITokenService tokenService,
        ILogger<EventService> logger)
    {
        _unitOfWork = unitOfWork;
        _tokenService = tokenService;
        _logger = logger;
    }

    public async Task<GenericResponseModel<EventResponseDto>> CreateEventAsync(CreateEventDto dto)
    {
        try
        {
            var userId = await _tokenService.GetCurrentUserIdAsync();

            var newEvent = new Event
            {
                Title = dto.Title,
                Description = dto.Description,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Location = dto.Location,
                AvailableSeats = dto.AvailableSeats,
                TotalSeats = dto.TotalSeats,
                Price = dto.Price,
                ImageUrl = dto.ImageUrl,
                Status = EventStatus.UPCOMING,
                CreatedAt = DateTime.UtcNow,
                OrganizerId = userId,
                Gallery = dto.Gallery
            };

            // Add categories
            var category = _unitOfWork.Repository<Category>()
                .FindBy(c => c.Name.ToLower() == dto.Category.ToLower())
                .FirstOrDefault();
            
            await _unitOfWork.Repository<Event>().Add(newEvent);
            await _unitOfWork.SaveChanges();

            if (category == null)
            {
                category = new Category
                {
                    Name = dto.Category,
                    Description = dto.Category
                };
                await _unitOfWork.Repository<Category>().Add(category);
                await _unitOfWork.SaveChanges();
            }
            
            var eventCategory = new EventCategory
            {
                EventId = newEvent.Id,
                CategoryId = category.Id
            };
            await _unitOfWork.Repository<EventCategory>().Add(eventCategory);
            await _unitOfWork.SaveChanges();

            // Reload the event with all necessary related entities to avoid null reference
            var createdEvent = await _unitOfWork.Repository<Event>()
                .FindBy(e => e.Id == newEvent.Id)
                .Include(e => e.Organizer)
                .Include(e => e.EventCategories)
                    .ThenInclude(ec => ec.Category)
                .Include(e => e.Faqs)
                .Include(e => e.Schedules)
                .Include(e => e.Reviews)
                .FirstOrDefaultAsync();

            return GenericResponseModel<EventResponseDto>.Success(MapToEventResponseDto(createdEvent));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating event");
            return GenericResponseModel<EventResponseDto>.Failure(
                "Failed to create event",
                new List<ErrorResponseModel>
                {
                    ErrorResponseModel.Create("Exception", ex.Message)
                });
        }
    }

    public async Task<GenericResponseModel<EventResponseDto>> GetEventByIdAsync(Guid id)
    {
        try
        {
            var _event = await _unitOfWork.Repository<Event>().FindBy(e => e.Id == id)
                .Include(e => e.Organizer)
                .Include(e => e.EventCategories)
                    .ThenInclude(ec => ec.Category)
                .Include(e => e.Faqs)
                .Include(e => e.Schedules)
                .Include(e => e.Reviews)
                .FirstOrDefaultAsync();
            if (_event == null)
            {
                return GenericResponseModel<EventResponseDto>.Failure(
                    "Event not found",
                    new List<ErrorResponseModel>
                    {
                        ErrorResponseModel.Create("Event", "Event not found")
                    });
            }
            return GenericResponseModel<EventResponseDto>.Success(MapToEventResponseDto(_event));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting event with ID: {EventId}", id);
            return GenericResponseModel<EventResponseDto>.Failure(
                "Failed to get event",
                new List<ErrorResponseModel>
                {
                    ErrorResponseModel.Create("Exception", ex.Message)
                });
        }
    }

    public async Task<GenericResponseModel<List<EventResponseDto>>> GetAllEventsAsync(EventFilterDto? filter, int pageNumber = 1, int pageSize = 10)
    {
        try
        {
            // Start with a base query
            var query = _unitOfWork.Repository<Event>()
                .GetQuerableData();

            // Apply filters only if filter is not null
            if (filter != null)
            {
                // Filter by category if provided
                if (!string.IsNullOrEmpty(filter.Category))
                {
                    query = query.Where(e => e.EventCategories.Any(ec => 
                        ec.Category.Name.ToLower() == filter.Category.ToLower()));
                }

                // Filter by min price if provided
                if (filter.MinPrice.HasValue)
                {
                    query = query.Where(e => e.Price >= filter.MinPrice.Value);
                }
                
                // Filter by max price if provided
                if (filter.MaxPrice.HasValue)
                {
                    query = query.Where(e => e.Price <= filter.MaxPrice.Value);
                }

                // Apply availability filter
                if (filter.Availability != null)
                {
                    switch (filter.Availability)
                    {
                        case AvailabilityFilter.Available:
                            query = query.Where(e => e.AvailableSeats > 0);
                            break;
                        case AvailabilityFilter.AlmostFull:
                            query = query.Where(e => e.AvailableSeats > 0 && 
                                ((double)e.AvailableSeats / e.TotalSeats) <= 0.2); // 20% or less seats available
                            break;
                        default:
                            break;
                    }
                }

                // Apply sorting - guard against null reference
                if (filter.SortBy!=null)
                {
                    query = filter.SortBy switch
                    {
                        SortBy.Date => filter.Ascending 
                            ? query.OrderBy(e => e.StartDate) 
                            : query.OrderByDescending(e => e.StartDate),
                        SortBy.Price => filter.Ascending 
                            ? query.OrderBy(e => e.Price) 
                            : query.OrderByDescending(e => e.Price),
                        SortBy.Name => filter.Ascending 
                            ? query.OrderBy(e => e.Title) 
                            : query.OrderByDescending(e => e.Title),
                        _ => filter.Ascending 
                            ? query.OrderBy(e => e.CreatedAt) 
                            : query.OrderByDescending(e => e.CreatedAt)
                    };
                }
                else
                {
                    // Default sorting if SortBy is not provided
                    query = filter.Ascending 
                        ? query.OrderBy(e => e.CreatedAt) 
                        : query.OrderByDescending(e => e.CreatedAt);
                }
            }
            else
            {
                // Default sorting when no filter is provided
                query = query.OrderByDescending(e => e.CreatedAt);
            }

            // Apply pagination
            var events = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Include(e => e.Organizer)
                .Include(e => e.EventCategories)
                .ThenInclude(ec => ec.Category)
                .Include(e => e.Faqs)
                .Include(e => e.Schedules)
                .Include(e => e.Reviews)
                .ToListAsync();

            return GenericResponseModel<List<EventResponseDto>>.Success(
                events.Select(MapToEventResponseDto).ToList());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting filtered events");
            return GenericResponseModel<List<EventResponseDto>>.Failure(
                "Failed to get events",
                new List<ErrorResponseModel>
                {
                    ErrorResponseModel.Create("Exception", ex.Message)
                });
        }
    }

    public async Task<GenericResponseModel<EventResponseDto>> UpdateEventAsync(Guid id, UpdateEventDto dto)
    {
        try
        {
            var _event = await _unitOfWork.Repository<Event>()
                .FindBy(e => e.Id == id)
                .FirstOrDefaultAsync();

            if (_event == null)
            {
                return GenericResponseModel<EventResponseDto>.Failure(
                    "Event not found",
                    new List<ErrorResponseModel>
                    {
                        ErrorResponseModel.Create("Event", "Event not found")
                    });
            }

            // Update event details
            _event.Title = dto.Title;
            _event.Description = dto.Description;
            _event.StartDate = dto.StartDate;
            _event.EndDate = dto.EndDate;
            _event.Location = dto.Location;
            _event.AvailableSeats = dto.AvailableSeats;
            _event.TotalSeats = dto.TotalSeats;
            _event.Price = dto.Price;
            _event.ImageUrl = dto.ImageUrl;
            _event.Gallery = dto.Gallery;
            _event.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.Repository<Event>().Update(_event);

            // Update categories
            // First, remove existing categories
            var existingCategories = await _unitOfWork.Repository<EventCategory>()
                .FindBy(ec => ec.EventId == id)
                .ToListAsync();

            // there is only one category
            var category = _unitOfWork.Repository<Category>()
                .FindBy(c => c.Name.ToLower() == dto.Category.ToLower())
                .FirstOrDefault();
            if (category == null)
            {
                category = new Category
                {
                    Name = dto.Category,
                    Description = dto.Category
                };
                await _unitOfWork.Repository<Category>().Add(category);
            }
            else
            {
                var eventCategory = new EventCategory
                {
                    EventId = _event.Id,
                    CategoryId = category.Id
                };
                await _unitOfWork.Repository<EventCategory>().Add(eventCategory);
            }

            await _unitOfWork.SaveChanges();

            return GenericResponseModel<EventResponseDto>.Success(MapToEventResponseDto(_event));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating event with ID: {EventId}", id);
            return GenericResponseModel<EventResponseDto>.Failure(
                "Failed to update event",
                new List<ErrorResponseModel>
                {
                    ErrorResponseModel.Create("Exception", ex.Message)
                });
        }
    }

    public async Task<GenericResponseModel<bool>> DeleteEventAsync(Guid id)
    {
        try
        {
            var _event = await _unitOfWork.Repository<Event>()
                .FindBy(e => e.Id == id)
                .FirstOrDefaultAsync();

            if (_event == null)
            {
                return GenericResponseModel<bool>.Failure(
                    "Event not found",
                    new List<ErrorResponseModel>
                    {
                        ErrorResponseModel.Create("Event", "Event not found")
                    });
            }

            // Delete related entities first
            var eventCategories = await _unitOfWork.Repository<EventCategory>()
                .FindBy(ec => ec.EventId == id)
                .ToListAsync();

            foreach (var category in eventCategories)
            {
                _unitOfWork.Repository<EventCategory>().Delete(category.CategoryId);
            }

            _unitOfWork.Repository<Event>().Delete(_event.Id);
            await _unitOfWork.SaveChanges();

            return GenericResponseModel<bool>.Success(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting event with ID: {EventId}", id);
            return GenericResponseModel<bool>.Failure(
                "Failed to delete event",
                new List<ErrorResponseModel>
                {
                    ErrorResponseModel.Create("Exception", ex.Message)
                });
        }
    }

    public async Task<GenericResponseModel<List<EventResponseDto>>> GetFeatureEvents(int page = 1, int pageSize = 10)
    {
        try
        {
            var events = await _unitOfWork.Repository<Event>()
                .GetQuerableData()
                .Include(e => e.Organizer)
                .Include(e => e.EventCategories)
                .ThenInclude(ec => ec.Category)
                .Include(e => e.Faqs)
                .Include(e => e.Schedules)
                .Include(e => e.Reviews)
                .OrderByDescending(e => e.CreatedAt)
                .Take(5)
                .OrderBy(e => e.CreatedAt)
                .ToListAsync();

            return GenericResponseModel<List<EventResponseDto>>.Success(
                events.Select(MapToEventResponseDto).ToList());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all events");
            return GenericResponseModel<List<EventResponseDto>>.Failure(
                "Failed to get events",
                new List<ErrorResponseModel>
                {
                    ErrorResponseModel.Create("Exception", ex.Message)
                });
        }
    }

    public async Task<GenericResponseModel<List<EventResponseDto>>> GetUpcomingEvents(int page = 1, int pageSize = 10)
    {
        try
        {
            var events = await _unitOfWork.Repository<Event>()
                .GetQuerableData()
                .Where(e => e.StartDate > DateTime.UtcNow)
                .Include(e => e.Organizer)
                .Include(e => e.EventCategories)
                .ThenInclude(ec => ec.Category)
                .Include(e => e.Faqs)
                .Include(e => e.Schedules)
                .Include(e => e.Reviews)
                .OrderByDescending(e => e.CreatedAt)
                .Take(5)
                .OrderBy(e => e.CreatedAt)
                .ToListAsync();

            return GenericResponseModel<List<EventResponseDto>>.Success(
                events.Select(MapToEventResponseDto).ToList());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all events");
            return GenericResponseModel<List<EventResponseDto>>.Failure(
                "Failed to get events",
                new List<ErrorResponseModel>
                {
                    ErrorResponseModel.Create("Exception", ex.Message)
                });
        }
    }

    public async Task<GenericResponseModel<List<EventResponseDto>>> GetBigEvents(int page = 1, int pageSize = 10)
    {
        try
        {
            var events = await _unitOfWork.Repository<Event>()
                .GetQuerableData()
                .Include(e => e.Organizer)
                .Include(e => e.EventCategories)
                .ThenInclude(ec => ec.Category)
                .Include(e => e.Faqs)
                .Include(e => e.Schedules)
                .Include(e => e.Reviews)
                .OrderByDescending(e => e.CreatedAt)
                .Take(5)
                .OrderBy(e => e.TotalSeats)
                .ToListAsync();

            return GenericResponseModel<List<EventResponseDto>>.Success(
                events.Select(MapToEventResponseDto).ToList());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all events");
            return GenericResponseModel<List<EventResponseDto>>.Failure(
                "Failed to get events",
                new List<ErrorResponseModel>
                {
                    ErrorResponseModel.Create("Exception", ex.Message)
                });
        }
    }

    public async Task<GenericResponseModel<List<AdminEventDto>>> GetAllEventsForAdminAsync()
    {
        try
        {
            // Get all events without pagination
            var events = await _unitOfWork.Repository<Event>()
                .GetQuerableData()
                .Include(e => e.EventCategories)
                .ThenInclude(ec => ec.Category)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();

            // Map to admin DTOs
            var adminEventDtos = events.Select(e => new AdminEventDto
            {
                Id = e.Id,
                Title = e.Title,
                Description = e.Description,
                StartDate = e.StartDate,
                EndDate = e.EndDate,
                Location = e.Location,
                AvailableSeats = e.AvailableSeats,
                TotalSeats = e.TotalSeats,
                Price = e.Price,
                ImageUrl = e.ImageUrl,
                Category = e.EventCategories.FirstOrDefault()?.Category?.Name,
                Gallery = e.Gallery?.ToList() ?? new List<string>(),
                CreatedAt = e.CreatedAt
            }).ToList();

            return GenericResponseModel<List<AdminEventDto>>.Success(adminEventDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all events for admin");
            return GenericResponseModel<List<AdminEventDto>>.Failure(
                "Failed to get all events",
                new List<ErrorResponseModel>
                {
                    ErrorResponseModel.Create("Exception", ex.Message)
                });
        }
    }

    private EventResponseDto MapToEventResponseDto(Event _event)
    {
        return new EventResponseDto
        {
            Id = _event.Id,
            Title = _event.Title,
            Description = _event.Description,
            StartDate = _event.StartDate,
            EndDate = _event.EndDate,
            Location = _event.Location,
            AvailableSeats = _event.AvailableSeats,
            TotalSeats = _event.TotalSeats,
            TicketSold = _event.TicketSold,
            Price = _event.Price,
            ImageUrl = _event.ImageUrl,
            Status = _event.Status,
            CreatedAt = _event.CreatedAt,
            UpdatedAt = _event.UpdatedAt,
            Organizer = new OrganizerDto
            {
                Id = _event.Organizer.Id,
                Name = _event.Organizer.Name,
                Email = _event.Organizer.Email
            },
            Category = _event.EventCategories.FirstOrDefault()?.Category?.Name,
            Gallery = _event.Gallery?.ToList() ?? new List<string>(),
            Faqs = _event.Faqs.Select(f => new FaqDto
            {
                Id = f.Id,
                Question = f.Question,
                Answer = f.Answer
            }).ToList(),
            Schedules = _event.Schedules.Select(s => new ScheduleDto
            {
                Id = s.Id,
                Activity = s.Activity,
                Time = s.Time,
                Description = s.Description
            }).ToList()
        };
    }
}