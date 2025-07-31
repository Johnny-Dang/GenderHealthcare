using AutoMapper;
using backend.Application.DTOs.TestServiceSlotDTO;
using backend.Application.Repositories;
using backend.Application.Services;
using backend.Domain.Entities;

namespace backend.Infrastructure.Services
{
    public class TestServiceSlotService: ITestServiceSlotService
    {
        private readonly ITestServiceSlotRepository _repository;
        private readonly ITestServiceRepository _serviceRepository;

        public TestServiceSlotService(
            ITestServiceSlotRepository repository,
            ITestServiceRepository serviceRepository)
        {
            _repository = repository;
            _serviceRepository = serviceRepository;
        }

        public async Task<Result<TestServiceSlotResponse>> CreateSlotAsync(CreateTestServiceSlotRequest request)
        {
            var service = await _serviceRepository.GetByIdAsync(request.ServiceId);
            if (service == null)
                return Result<TestServiceSlotResponse>.Failure("Dịch vụ không tồn tại");

            var existingSlots = await _repository.GetByServiceIdAndDateAsync(request.ServiceId, request.SlotDate);
            if (existingSlots.Any(s => s.Shift == request.Shift))
                return Result<TestServiceSlotResponse>.Failure($"Đã có slot {request.Shift} cho dịch vụ này vào ngày {request.SlotDate}");

            var slot = new TestServiceSlot
            {
                ServiceId = request.ServiceId,
                SlotDate = request.SlotDate,
                Shift = request.Shift,
                MaxQuantity = request.MaxQuantity,
                CurrentQuantity = 0
            };

            var createdSlot = await _repository.CreateAsync(slot);

            var response = MapToResponse(createdSlot, service.ServiceName);

            return Result<TestServiceSlotResponse>.Success(response);
        }

        public async Task<Result<TestServiceSlotResponse>> FindOrCreateSlotAsync(Guid serviceId, DateOnly date, string shift)
        {
            var service = await _serviceRepository.GetByIdAsync(serviceId);
            if (service == null)
                return Result<TestServiceSlotResponse>.Failure("Dịch vụ không tồn tại");

            var slot = await _repository.FindOrCreateSlotAsync(serviceId, date, shift);

            var response = MapToResponse(slot, service.ServiceName);

            return Result<TestServiceSlotResponse>.Success(response);
        }

        public async Task<Result<bool>> DeleteSlotAsync(Guid slotId)
        {
            if (!await _repository.ExistsAsync(slotId))
                return Result<bool>.Failure("Slot không tồn tại");

            var result = await _repository.DeleteAsync(slotId);
            if (!result)
                return Result<bool>.Failure("Không thể xóa slot đã có booking");

            return Result<bool>.Success(result);
        }

        public async Task<Result<TestServiceSlotResponse>> GetSlotByIdAsync(Guid slotId)
        {
            var slot = await _repository.GetByIdAsync(slotId);
            if (slot == null)
                return Result<TestServiceSlotResponse>.Failure("Slot không tồn tại");

            var response = MapToResponse(slot, slot.TestService?.ServiceName ?? string.Empty);

            return Result<TestServiceSlotResponse>.Success(response);
        }

        public async Task<Result<List<TestServiceSlotResponse>>> GetSlotsByServiceIdAndDateAsync(Guid serviceId, DateOnly date)
        {
            if (!await _serviceRepository.ExistsAsync(serviceId))
                return Result<List<TestServiceSlotResponse>>.Failure("Dịch vụ không tồn tại");

            var slots = await _repository.GetByServiceIdAndDateAsync(serviceId, date);

            var response = slots.Select(slot =>
                MapToResponse(slot, slot.TestService?.ServiceName ?? string.Empty)
            ).ToList();

            return Result<List<TestServiceSlotResponse>>.Success(response);
        }

        public async Task<Result<List<TestServiceSlotResponse>>> GetSlotsByServiceIdAsync(Guid serviceId)
        {
            if (!await _serviceRepository.ExistsAsync(serviceId))
                return Result<List<TestServiceSlotResponse>>.Failure("Dịch vụ không tồn tại");

            var slots = await _repository.GetByServiceIdAsync(serviceId);

            var response = slots.Select(slot =>
                MapToResponse(slot, slot.TestService?.ServiceName ?? string.Empty)
            ).ToList();

            return Result<List<TestServiceSlotResponse>>.Success(response);
        }

        public async Task<Result<bool>> HasAvailableCapacityAsync(Guid slotId)
        {
            if (!await _repository.ExistsAsync(slotId))
                return Result<bool>.Failure("Slot không tồn tại");

            return Result<bool>.Success(await _repository.HasAvailableCapacityAsync(slotId));
        }

        public async Task<Result<TestServiceSlotResponse>> UpdateSlotAsync(Guid slotId, UpdateTestServiceSlotRequest request)
        {
            var slot = await _repository.GetByIdAsync(slotId);
            if (slot == null)
                return Result<TestServiceSlotResponse>.Failure("Slot không tồn tại");

            if (request.MaxQuantity.HasValue)
            {
                if (request.MaxQuantity < slot.CurrentQuantity)
                    return Result<TestServiceSlotResponse>.Failure($"Số lượng tối đa phải lớn hơn hoặc bằng số lượng đã đặt ({slot.CurrentQuantity})");

                slot.MaxQuantity = request.MaxQuantity.Value;
            }

            var updatedSlot = await _repository.UpdateAsync(slot);
            var response = MapToResponse(updatedSlot, updatedSlot.TestService?.ServiceName ?? string.Empty);

            return Result<TestServiceSlotResponse>.Success(response);
        }

        public async Task<Result<bool>> IncrementSlotQuantityAsync(Guid slotId)
        {
            if (!await _repository.ExistsAsync(slotId))
                return Result<bool>.Failure("Slot không tồn tại");

            var result = await _repository.IncrementCurrentQuantityAsync(slotId);
            return Result<bool>.Success(result);
        }

        public async Task<Result<bool>> DecrementSlotQuantityAsync(Guid slotId)
        {
            if (!await _repository.ExistsAsync(slotId))
                return Result<bool>.Failure("Slot không tồn tại");

            var result = await _repository.DecrementCurrentQuantityAsync(slotId);
            return Result<bool>.Success(result);
        }

        // Helper method to map entity to response
        private TestServiceSlotResponse MapToResponse(TestServiceSlot slot, string serviceName)
        {
            return new TestServiceSlotResponse
            {
                SlotId = slot.SlotId,
                ServiceId = slot.ServiceId,
                ServiceName = serviceName,
                SlotDate = slot.SlotDate,
                Shift = slot.Shift,
                MaxQuantity = slot.MaxQuantity,
                CurrentQuantity = slot.CurrentQuantity
            };
        }
    }
}
