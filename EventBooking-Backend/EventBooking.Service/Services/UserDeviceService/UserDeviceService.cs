﻿using System.Security.Claims;
using EventBooking.DB.Models;
using EventBooking.UnitOfWork;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace EventBooking.Service.Services.UserDeviceService;

public class UserDeviceService : IUserDeviceService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UserDeviceService(IUnitOfWork unitOfWork, IConfiguration configuration , IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
        _unitOfWork = unitOfWork;
    }

    public async Task<UserDevice> RegisterDeviceAsync(Guid userId, string deviceId, string deviceName, string platform, string deviceType)
    {
        var existingDevice = await GetDeviceAsync(userId, deviceId);
        if (existingDevice != null)
        {
            existingDevice.LastUsedAt = DateTime.UtcNow;
            await _unitOfWork.Repository<UserDevice>().Update(existingDevice);
            await _unitOfWork.SaveChanges();
            return existingDevice;
        }
        

        var newDevice = new UserDevice
        {
            UserId = userId,
            DeviceId = deviceId,
            DeviceName = deviceName,
            Platform = platform,
            DeviceType = deviceType,
            LastUsedAt = DateTime.UtcNow
        };

        await _unitOfWork.Repository<UserDevice>().Add(newDevice);
        await _unitOfWork.SaveChanges();

        return newDevice;
    }

    public async Task<UserDevice?> GetDeviceAsync(Guid userId, string deviceId)
    {
        return await _unitOfWork.Repository<UserDevice>()
            .FindBy(d => d.UserId == userId && d.DeviceId == deviceId)
            .Include(d => d.RefreshToken)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<UserDevice>> GetUserDevicesAsync(Guid userId)
    {
        return await _unitOfWork.Repository<UserDevice>()
            .FindBy(d => d.UserId == userId)
            .Include(d => d.RefreshToken)
            .OrderByDescending(d => d.LastUsedAt)
            .ToListAsync();
    }

    public async Task<bool> DeactivateDeviceAsync(Guid userId, string deviceId)
    {
        var device = await GetDeviceAsync(userId, deviceId);
        if (device?.RefreshToken == null) return false;

        device.RefreshToken.Expires = DateTime.UtcNow;
        await _unitOfWork.Repository<RefreshToken>().Update(device.RefreshToken);
        await _unitOfWork.SaveChanges();
        return true;
    }

    public async Task<int> GetActiveDeviceCountAsync(Guid userId)
    {
        return await _unitOfWork.Repository<UserDevice>()
            .FindBy(d => d.UserId == userId)
            .CountAsync();
    }
    public string? GetCurrentDeviceId()
    {
        var currentDeviceId = _httpContextAccessor.HttpContext?.User.FindFirstValue("DeviceId");
        return currentDeviceId;
    }
}