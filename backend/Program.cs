using backend.Application.Common.Mappings;
using backend.Application.Validators;
using backend.Domain.AppsettingsConfigurations;
using backend.Infrastructure.Database;
using backend.Infrastructure.Extensions;
using backend.Infrastructure.Persistence.Configurations;
using DeployGenderSystem.Domain.Entity;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddService();

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(
    option =>
    {
        option.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "GenderHealthcareServiceManagementSystem",
            Version = "v1",
            Description = "GenderHealthcareServiceManagementSystem API",
        });
        var securityScheme = new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Please enter a token",
            Reference = new OpenApiReference
            {
                Type = ReferenceType.SecurityScheme,
                Id = "Bearer"
            }
        };

        option.AddSecurityDefinition("Bearer", securityScheme);

        option.AddSecurityRequirement(new OpenApiSecurityRequirement
{
    { securityScheme, new string[] { } }
});
    });
var jwtSettings = builder.Configuration.GetSection("JwtSettings");

builder.Services.Configure<JwtSettings>(jwtSettings);

builder.Services.AddAuthentication(option =>
{
    option.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    option.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, option =>
{
    option.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,//Kiểm tra Issuer (người phát hành token) có hợp lệ không
        ValidateAudience = true,//Kiểm tra Audience (người nhận token) có đúng không
        ValidateLifetime = true,//	Kiểm tra token còn hạn hay không
        ValidateIssuerSigningKey = true,//Kiểm tra chữ ký token có hợp lệ không
        ClockSkew = TimeSpan.Zero,//Dung sai thời gian. TimeSpan.Zero nghĩa là không cho sai số, token hết hạn là hết luôn
        IssuerSigningKey = new SymmetricSecurityKey(
            System.Text.Encoding.UTF8.GetBytes(jwtSettings["SecretKey"])),
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"]
    };
});

builder.Services.AddAuthorization();


builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    options.UseSqlServer(connectionString);
});

builder.Services.AddDbContext<IApplicationDbContext, ApplicationDbContext>();

builder.Services.AddAutoMapper(typeof(AccountProfile),typeof(RoleProfile));


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseAuthentication();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
