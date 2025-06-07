using FluentValidation;
using backend.Application.DTOs.Accounts;
namespace StudentManagementSystem.Application.ModelValidation
{
    public class RegisterAccountRequestValidator : AbstractValidator<RegisterRequest>
    {
        public RegisterAccountRequestValidator()
        {

            RuleFor(x => x.Email)
               .NotEmpty().WithMessage("Email is required.")
               .EmailAddress().WithMessage("Email is not valid.")
               .MaximumLength(255);

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required.")
                .MinimumLength(6).WithMessage("Password must be at least 6 characters.");

            RuleFor(x => x.FirstName)
                .MaximumLength(50)
                .When(x => !string.IsNullOrWhiteSpace(x.FirstName));

            RuleFor(x => x.LastName)
                .MaximumLength(50)
                .When(x => !string.IsNullOrWhiteSpace(x.LastName));

            RuleFor(x => x.Phone)
                .MaximumLength(20)
                .Matches(@"^0\d{9,10}$")
                .When(x => !string.IsNullOrWhiteSpace(x.Phone))
                .WithMessage("Phone number must be numeric and up to 10 digits.");

            RuleFor(x => x.AvatarUrl)
                .MaximumLength(500)
                .When(x => !string.IsNullOrWhiteSpace(x.AvatarUrl));

            RuleFor(x => x.DateOfBirth)
                .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.Today))
                .When(x => x.DateOfBirth.HasValue)
                .WithMessage("Date of birth cannot be in the future.");
        }
    }
}
