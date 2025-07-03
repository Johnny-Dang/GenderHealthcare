namespace backend.Application.DTOs.TestServiceSlotDTO
{
    public class TestServiceSlotResponse
    {
        public Guid SlotId { get; set; }
        public Guid ServiceId { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public DateOnly SlotDate { get; set; }
        public string Shift { get; set; } = string.Empty;
        public int MaxQuantity { get; set; }
        public int CurrentQuantity { get; set; }
        public int AvailableQuantity => MaxQuantity - CurrentQuantity;
        public bool IsAvailable => CurrentQuantity < MaxQuantity;
    }
}
