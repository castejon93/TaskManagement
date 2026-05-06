using Serilog;
using TaskManagement.Application;
using TaskManagement.Infrastructure;
using TaskManagement.API.Middleware;

// ─── Bootstrap Serilog before anything else ───────────────────────────────────
// This ensures even startup errors are captured in the log file.
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/taskmanagement-.log", rollingInterval: RollingInterval.Day)
    .CreateBootstrapLogger();

try
{
    WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

    // Replace the default .NET logger with Serilog.
    builder.Host.UseSerilog((context, services, configuration) =>
        configuration
            .ReadFrom.Configuration(context.Configuration)   // reads from appsettings.json
            .ReadFrom.Services(services)
            .Enrich.FromLogContext()
            .WriteTo.Console()
            .WriteTo.File("logs/taskmanagement-.log", rollingInterval: RollingInterval.Day));

    // ─── Register layers ───────────────────────────────────────────────────────
    builder.Services.AddApplication();                                    // Application layer
    builder.Services.AddInfrastructure(builder.Configuration);            // Infrastructure layer

    // ─── CORS ─────────────────────────────────────────────────────────────────
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("LocalDev", policy =>
            policy.WithOrigins("*")
                  .AllowAnyHeader()
                  .AllowAnyMethod());
    });

    // ─── Controllers ──────────────────────────────────────────────────────────
    builder.Services.AddControllers();

    // ─── Swagger / OpenAPI ─────────────────────────────────────────────────────
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new()
        {
            Title = "Task Management API",
            Version = "v1",
            Description = "REST API for the Task Management System — Prueba Técnica Fullstack Semisenior"
        });
    });

    // ─── Build app ────────────────────────────────────────────────────────────
    var app = builder.Build();

    // ─── Global error handling middleware (must be first) ─────────────────────
    app.UseMiddleware<GlobalExceptionMiddleware>();

    // ─── CORS — must be before UseAuthorization and MapControllers ────────────
    app.UseCors("LocalDev");

    // ─── Serilog request logging (logs every HTTP request) ────────────────────
    app.UseSerilogRequestLogging();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    // Skip HTTPS redirection in development — it breaks Swagger UI on localhost
    // because the browser blocks the HTTP→HTTPS redirect as a CORS violation.
    if (!app.Environment.IsDevelopment())
        app.UseHttpsRedirection();

    app.UseAuthorization();
    app.MapControllers();

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly.");
}
finally
{
    Log.CloseAndFlush();
}