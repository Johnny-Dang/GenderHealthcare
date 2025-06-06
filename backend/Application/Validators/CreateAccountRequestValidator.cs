using FluentValidation;
using backend.Application.DTOs.Accounts;
namespace StudentManagementSystem.Application.ModelValidation
{
    public class CreateAccountRequestValidator : AbstractValidator<CreateAccountRequest>
    {
        public CreateAccountRequestValidator()
        {

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("Invalid email format.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required.")
                .MinimumLength(6).WithMessage("Password must be at least 6 characters.");

            RuleFor(x => x.FirstName)
                .MaximumLength(50).WithMessage("First name too long.");

            RuleFor(x => x.LastName)
                .MaximumLength(50).WithMessage("Last name too long.");

            RuleFor(x => x.Phone)
                .Matches(@"^0\d{9,10}$")
                .When(x => !string.IsNullOrWhiteSpace(x.Phone))
                .WithMessage("Invalid Vietnamese phone number format.");
        }
    }
}