using backend.Application.DTOs.ConsultationBookingDTO;
using FluentValidation;

namespace backend.Application.Validators
{
    public class CreateConsultationBookingRequestValidator : AbstractValidator<CreateConsultationBookingRequest>
    {
        public CreateConsultationBookingRequestValidator()
        {
            // Nếu không có CustomerId thì phải có đủ thông tin guest
            RuleFor(x => x.GuestName)
                .NotEmpty()
                .When(x => !x.CustomerId.HasValue)
                .WithMessage("GuestName is required if CustomerId is not provided.")
                .MaximumLength(100);

            RuleFor(x => x.GuestEmail)
                .NotEmpty()
                .When(x => !x.CustomerId.HasValue)
                .WithMessage("GuestEmail is required if CustomerId is not provided.")
                .MaximumLength(100)
                .EmailAddress().When(x => !string.IsNullOrEmpty(x.GuestEmail));

            RuleFor(x => x.GuestPhone)
                .NotEmpty()
                .When(x => !x.CustomerId.HasValue)
                .WithMessage("GuestPhone is required if CustomerId is not provided.")
                .MaximumLength(20);

            RuleFor(x => x.StaffId)
                .NotEqual(Guid.Empty).WithMessage("StaffId is required.");

            RuleFor(x => x.ScheduledAt)
                .GreaterThan(DateTime.UtcNow).WithMessage("ScheduledAt must be in the future.");

            RuleFor(x => x.Message)
                .MaximumLength(1000).When(x => !string.IsNullOrEmpty(x.Message));
        }
    }
}
