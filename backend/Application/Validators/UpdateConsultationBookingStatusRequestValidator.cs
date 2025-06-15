using backend.Application.DTOs.BlogDTO;
using backend.Application.DTOs.ConsultationBookingDTO;
using FluentValidation;

namespace backend.Application.Validators
{
    public class UpdateConsultationBookingStatusRequestValidator: AbstractValidator<UpdateConsultationBookingStatusRequest>
    {
        public UpdateConsultationBookingStatusRequestValidator()
        {
            RuleFor(x => x.BookingId)
                .NotEqual(Guid.Empty).WithMessage("BookingId is required.");
            RuleFor(x => x.Status)
                .NotEmpty().WithMessage("Status is required.")
                .Must(status => status == "pending" || status == "confirmed" || status == "cancelled")
                .WithMessage("Status must be one of the following: pending, confirmed, cancelled.");
        }
    }
}
