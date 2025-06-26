using backend.Application.DTOs.ConsultantDTO;
using FluentValidation;

namespace backend.Application.Validators
{
    public class ConsultantUpdateRequestValidator : AbstractValidator<ConsultantUpdateRequest>
    {
        public ConsultantUpdateRequestValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty()
                .MaximumLength(100);

            RuleFor(x => x.Phone)
                .MaximumLength(20);

            RuleFor(x => x.AvatarUrl)
                .MaximumLength(250);

            RuleFor(x => x.Department)
                .MaximumLength(100);

            RuleFor(x => x.Degree)
                .MaximumLength(100);

            RuleFor(x => x.YearOfExperience)
                .GreaterThanOrEqualTo(0)
                .When(x => x.YearOfExperience.HasValue);

            RuleFor(x => x.Biography)
                .MaximumLength(1000);
        }
    }
}
