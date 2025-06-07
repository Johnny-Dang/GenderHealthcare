using backend.Application.DTOs.Accounts;
using FluentValidation;

namespace backend.Application.Validators
{
    public class UpdateAccountRequestValidator : AbstractValidator<UpdateAccountRequest>
    {
        public UpdateAccountRequestValidator()
        {
            RuleFor(x => x.FirstName).MaximumLength(50);
            RuleFor(x => x.LastName).MaximumLength(50);
            RuleFor(x => x.Phone).MaximumLength(20);
            RuleFor(x => x.RoleName).NotEmpty();
        }

    }
}
