using backend.Application.Repositories;

namespace backend.Infrastructure.BackgroundJobs
{
    public class SlotGenerationJob
    {
        private readonly ITestServiceSlotRepository _slotRepository;
        private readonly ITestServiceRepository _serviceRepository;

        public SlotGenerationJob(ITestServiceSlotRepository slotRepository, ITestServiceRepository serviceRepository)
        {
            _slotRepository = slotRepository;
            _serviceRepository = serviceRepository;
        }

        public async Task GenerateSlotsForAllServicesNextWeek()
        {
            var services = await _serviceRepository.GetAllAsync();
            foreach (var service in services)
            {
                await _slotRepository.GenerateSlotsForUpcomingWeeksAsync(service.ServiceId);
            }
        }
    }
}
