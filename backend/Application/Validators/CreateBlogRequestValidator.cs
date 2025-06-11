using backend.Application.DTOs.BlogDTO;
using backend.Domain.Entities;
using FluentValidation;

namespace backend.Application.Validators
{
    public class CreateBlogRequestValidator : AbstractValidator<CreateBlogRequest>
    {
        public CreateBlogRequestValidator()
        {
            RuleFor(x => x.Title)
                 .NotEmpty().WithMessage("Title is required.")
                 .MaximumLength(100).WithMessage("Title cannot exceed 100 characters.");

            RuleFor(x => x.Slug)
                .NotEmpty().WithMessage("Slug is required.")
                .MaximumLength(100).WithMessage("Slug cannot exceed 100 characters.");

            RuleFor(x => x.Content)
                .NotEmpty().WithMessage("Content is required.");

            RuleFor(x => x.Excerpt)
                .MaximumLength(500).WithMessage("Excerpt cannot exceed 500 characters.")
                .When(x => !string.IsNullOrEmpty(x.Excerpt));

            RuleFor(x => x.AuthorId)
                .NotEqual(Guid.Empty).WithMessage("AuthorId is required.");

            RuleFor(x => x.CategoryId)
                .NotEqual(Guid.Empty).WithMessage("AuthorId is required.");

            RuleFor(x => x.FeaturedImageUrl)
                .Must(url => string.IsNullOrEmpty(url) || Uri.IsWellFormedUriString(url, UriKind.Absolute))
                .WithMessage("ImageUrl phải là một đường dẫn hợp lệ.");

        }
    }
}
