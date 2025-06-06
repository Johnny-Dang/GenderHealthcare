using backend.Application.DTOs.Roles;
using FluentValidation;

namespace backend.Application.Validators
{
    public class CreateRoleRequestValidator : AbstractValidator<CreateRoleRequest>
    {
        public CreateRoleRequestValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Tên vai trò không được để trống.")
                .MaximumLength(100);

            RuleFor(x => x.Description)
                .MaximumLength(250);
        }
    }
}
