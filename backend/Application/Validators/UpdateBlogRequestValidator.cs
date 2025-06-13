using backend.Application.DTOs.BlogDTO;
using FluentValidation;

namespace backend.Application.Validators
{
    public class UpdateBlogRequestValidator : AbstractValidator<UpdateBlogRequest>
    {
        public UpdateBlogRequestValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Tiêu đề không được để trống.")
                .MaximumLength(100).WithMessage("Tiêu đề không được vượt quá 100 ký tự.");

            RuleFor(x => x.Content)
                .NotEmpty().WithMessage("Nội dung không được để trống.");

            RuleFor(x => x.Excerpt)
                .MaximumLength(500).WithMessage("Tóm tắt không được vượt quá 500 ký tự.")
                .When(x => !string.IsNullOrEmpty(x.Excerpt));

            RuleFor(x => x.AuthorId)
                .NotEqual(Guid.Empty).WithMessage("AuthorId is required.");

            RuleFor(x => x.CategoryId)
                .NotEqual(Guid.Empty).WithMessage("CategoryId is required.");

            RuleFor(x => x.FeaturedImageUrl)
                .Must(url => string.IsNullOrEmpty(url) || Uri.IsWellFormedUriString(url, UriKind.Absolute))
                .WithMessage("Đường dẫn ảnh phải là một URL hợp lệ.");
        }
    }
}
