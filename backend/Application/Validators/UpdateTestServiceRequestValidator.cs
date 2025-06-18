using backend.Application.DTOs.ServiceDTO;
using FluentValidation;

namespace backend.Application.Validators
{
    public class UpdateTestServiceRequestValidator : AbstractValidator<UpdateTestServiceRequest>
    {
        public UpdateTestServiceRequestValidator()
        {
            RuleFor(x => x.Id)
                .NotEqual(Guid.Empty).WithMessage("Id dịch vụ không được để trống.");

            RuleFor(x => x.ServiceName)
                .NotEmpty().WithMessage("Tên dịch vụ không được để trống.")
                .MaximumLength(100).WithMessage("Tên dịch vụ không được vượt quá 100 ký tự.");

            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("Mô tả không được để trống.")
                .MaximumLength(1000).WithMessage("Mô tả không được vượt quá 1000 ký tự.");

            RuleFor(x => x.Price)
                .GreaterThan(0).WithMessage("Giá phải lớn hơn 0.");

            RuleFor(x => x.ImageUrl)
                .Must(url => string.IsNullOrEmpty(url) || Uri.IsWellFormedUriString(url, UriKind.Absolute))
                .WithMessage("ImageUrl phải là một đường dẫn hợp lệ.");

            RuleFor(x => x.Category)
                .NotEmpty().WithMessage("Danh mục không được để trống.")
                .MaximumLength(100).WithMessage("Danh mục không được vượt quá 100 ký tự.");
        }
    }
}
