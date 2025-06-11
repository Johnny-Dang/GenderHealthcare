using backend.Application.DTOs.ServiceDTO;
using FluentValidation;

namespace backend.Application.Validators
{
    public class TestServiceCreateRequestValidator: AbstractValidator<CreateTestServiceRequest>
    {
        public TestServiceCreateRequestValidator() 
        {
            RuleFor(x => x.ServiceName)
                    .NotEmpty().WithMessage("Tên dịch vụ không được để trống.")
                    .MaximumLength(100);

            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("Mô tả không được để trống.")
                .MaximumLength(1000);

            RuleFor(x => x.Price)
                .GreaterThan(0).WithMessage("Giá phải lớn hơn 0.");

            RuleFor(x => x.ImageUrl)
                .Must(url => string.IsNullOrEmpty(url) || Uri.IsWellFormedUriString(url, UriKind.Absolute))
                .WithMessage("ImageUrl phải là một đường dẫn hợp lệ.");

            RuleFor(x => x.Duration)
                .NotEmpty().WithMessage("Thời lượng không được để trống.")
                .MaximumLength(50);

            RuleFor(x => x.Category)
                .NotEmpty().WithMessage("Danh mục không được để trống.")
                .MaximumLength(100);
        }
    }
}
