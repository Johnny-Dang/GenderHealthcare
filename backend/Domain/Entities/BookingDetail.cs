using Microsoft.Identity.Client;

namespace backend.Domain.Entities
{
    public class BookingDetail
    {
        public Guid BookingDetailId { get; set; } 

        public Guid BookingId { get; set; }

        public Guid ServiceId { get; set; }

        public string FirstName { get; set; } = default!;

        public string LastName { get; set; } = default!;
        
        public string Phone { get; set; } = default!;   

        public string Status { get; set; } = "chưa xét nghiệm";

        public DateOnly DateOfBirth {  get; set; }  

        public bool Gender { get; set; } = false;

        public Booking Booking { get; set; } = default!;

        public TestResult TestResult { get; set; } = default!;

        public TestService TestService { get; set; } = default!;
    }
}
