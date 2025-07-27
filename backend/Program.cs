using backend.API.Middleware;
using backend.Application.Common.Mappings;
using backend.Application.Services;
using backend.Application.Validators;
using backend.Domain.AppsettingsConfigurations;
using backend.Infrastructure.BackgroundJobs;
using backend.Infrastructure.Database;
using backend.Infrastructure.Extensions;
using backend.Infrastructure.Filters;
using backend.Infrastructure.Persistence.Configurations;
using backend.Infrastructure.Services;
using DeployGenderSystem.Domain.Entity;
using FluentValidation;
using FluentValidation.AspNetCore;
using Hangfire;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Hangfire config
builder.Services.AddHangfire(config =>
    config.UseSqlServerStorage(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddHangfireServer();

// Add services to the container.
builder.Services.AddService();

// note hangfire job này sẽ chạy mỗi ngày lúc 00:00
builder.Services.AddScoped<SlotGenerationJob>();

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddFluentValidationAutoValidation();

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
        
        option.OperationFilter<FileUploadOperation>();
    });

builder.Services.AddMemoryCache();

// Configure settings
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
builder.Services.Configure<JwtSettings>(jwtSettings);

builder.Services.Configure<GeminiSettings>(builder.Configuration.GetSection("Gemini"));

builder.Services.Configure<CloudinarySettings>(builder.Configuration.GetSection("CloudinarySettings"));

builder.Services.AddAuthentication(option =>
{
    option.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    option.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, option =>
{
    option.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ClockSkew = TimeSpan.Zero,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtSettings["SecretKey"])),
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


builder.Services.AddAutoMapper(typeof(AccountProfile), typeof(RoleProfile), typeof(FeedbackProfile), typeof(StaffInfoProfile));

builder.Services.AddHttpClient<IGeminiService, GeminiService>();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // domain React và Vite
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
// CORS middleware should be called early in the pipeline
app.UseCors("AllowFrontend");

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseJwtMiddleware(); // Add the JWT blacklist middleware

app.UseAuthentication();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

// Hangfire dashboard (truy cập /hangfire để xem job)
app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = new[] { new AdminDashboardAuthorizationFilter() }
});

// Đăng ký job chạy mỗi thứ 2 lúc 0h
RecurringJob.AddOrUpdate<SlotGenerationJob>(
    "generate-slots-weekly",
    job => job.GenerateSlotsForAllServicesNextWeek(),
    "0 0 * * 1" // Cron: mỗi thứ 2 lúc 0h
);

app.Run();
