using backend.Application.Repositories;
using backend.Domain.Entities;
using backend.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Repositories
{
    public class TestServiceSlotRepository : ITestServiceSlotRepository
    {
        private readonly IApplicationDbContext _context;
        public TestServiceSlotRepository(IApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<TestServiceSlot> CreateAsync(TestServiceSlot slot)
        {
            slot.SlotId = Guid.NewGuid();
            slot.CreatedAt = DateTime.UtcNow;
            slot.UpdatedAt = DateTime.UtcNow;

            await _context.TestServiceSlot.AddAsync(slot);
            await _context.SaveChangesAsync();

            return slot;
        }

        public async Task<TestServiceSlot> FindOrCreateSlotAsync(Guid serviceId, DateOnly date, string shift)
        {
            // Check if slot already exists
            var existingSlot = await _context.TestServiceSlot
                .FirstOrDefaultAsync(s => s.ServiceId == serviceId && s.SlotDate == date && s.Shift == shift);

            if (existingSlot != null)
                return existingSlot;

            var newSlot = new TestServiceSlot
            {
                SlotId = Guid.NewGuid(),
                ServiceId = serviceId,
                SlotDate = date,
                Shift = shift,
                MaxQuantity = 10, // Default value
                CurrentQuantity = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _context.TestServiceSlot.AddAsync(newSlot);
            await _context.SaveChangesAsync();

            return newSlot;
        }

        public async Task<bool> DeleteAsync(Guid slotId)
        {
            var slot = await _context.TestServiceSlot.FindAsync(slotId);
            if (slot == null)
                return false;

            // Check if slot has any bookings
            bool hasBookings = await _context.BookingDetail.AnyAsync(bd => bd.SlotId == slotId);
            if (hasBookings)
                return false; // Cannot delete slot with bookings

            _context.TestServiceSlot.Remove(slot);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DecrementCurrentQuantityAsync(Guid slotId)
        {
            var slot = await _context.TestServiceSlot.FindAsync(slotId);
            if (slot == null || slot.CurrentQuantity <= 0)
                return false;

            slot.CurrentQuantity -= 1;
            slot.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(Guid slotId)
        {
            return await _context.TestServiceSlot.AnyAsync(s => s.SlotId == slotId);
        }

        public async Task<List<TestServiceSlot>> GetAllAsync()
        {
            return await _context.TestServiceSlot
                .Include(s => s.TestService)
                .OrderBy(s => s.SlotDate)
                .ThenBy(s => s.Shift)
                .ToListAsync();
        }

        public async Task<TestServiceSlot> GetByIdAsync(Guid slotId)
        {
            return await _context.TestServiceSlot
                .Include(s => s.TestService)
                .FirstOrDefaultAsync(s => s.SlotId == slotId);
        }

        public async Task<List<TestServiceSlot>> GetByServiceIdAsync(Guid serviceId)
        {
            var today = DateOnly.FromDateTime(DateTime.Today);
            var endDate = today.AddDays(6); // 7 ngày (hôm nay + 6)

            return await _context.TestServiceSlot
                .Where(s => s.ServiceId == serviceId && s.SlotDate >= today && s.SlotDate <= endDate)
                .Include(s => s.TestService)
                .OrderBy(s => s.SlotDate)
                .ThenBy(s => s.Shift)
                .ToListAsync();
        }

        public async Task<List<TestServiceSlot>> GetByServiceIdAndDateAsync(Guid serviceId, DateOnly date)
        {
            return await _context.TestServiceSlot
                .Where(s => s.ServiceId == serviceId && s.SlotDate == date)
                .Include(s => s.TestService)
                .OrderBy(s => s.Shift)
                .ToListAsync();
        }

        public async Task<bool> HasAvailableCapacityAsync(Guid slotId)
        {
            var slot = await _context.TestServiceSlot.FindAsync(slotId);
            return slot != null && slot.CurrentQuantity < slot.MaxQuantity;
        }

        public async Task<bool> IncrementCurrentQuantityAsync(Guid slotId)
        {
            var slot = await _context.TestServiceSlot.FindAsync(slotId);
            if (slot == null || slot.CurrentQuantity >= slot.MaxQuantity)
                return false;

            slot.CurrentQuantity += 1;
            slot.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<TestServiceSlot> UpdateAsync(TestServiceSlot slot)
        {
            slot.UpdatedAt = DateTime.UtcNow;
            _context.TestServiceSlot.Update(slot);
            await _context.SaveChangesAsync();
            return slot;
        }

        // <summary>
        /// Generates slots for the next week starting from the next Monday.
        ///     
        public async Task GenerateSlotsForUpcomingWeeksAsync(Guid serviceId, int numberOfWeeks = 2, int maxQuantity = 10)
        {
            var shifts = new List<string> { "AM", "PM" };
            var today = DateOnly.FromDateTime(DateTime.Today);

            // Tìm ngày thứ 2 tiếp theo
            int daysUntilNextMonday = ((int)DayOfWeek.Monday - (int)today.DayOfWeek + 7) % 7;
            if (daysUntilNextMonday == 0) daysUntilNextMonday = 7;
            var nextMonday = today.AddDays(daysUntilNextMonday);

            for (int week = 0; week < numberOfWeeks; week++)
            {
                for (int i = 0; i < 6; i++) // Thứ 2 đến thứ 7
                {
                    var date = nextMonday.AddDays(week * 7 + i);
                    foreach (var shift in shifts)
                    {
                        bool exists = await _context.TestServiceSlot
                            .AnyAsync(s => s.ServiceId == serviceId && s.SlotDate == date && s.Shift == shift);
                        if (!exists)
                        {
                            var slot = new TestServiceSlot
                            {
                                SlotId = Guid.NewGuid(),
                                ServiceId = serviceId,
                                SlotDate = date,
                                Shift = shift,
                                MaxQuantity = maxQuantity,
                                CurrentQuantity = 0,
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow
                            };
                            await _context.TestServiceSlot.AddAsync(slot);
                        }
                    }
                }
            }
            await _context.SaveChangesAsync();
        }
    }
}
