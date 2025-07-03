using System.ComponentModel.DataAnnotations;

namespace backend.Application.DTOs.TestServiceSlotDTO
{
    public class UpdateTestServiceSlotRequest
    {
        [Range(1, 100)]
        public int? MaxQuantity { get; set; }
    }
}
