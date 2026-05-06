using System.Net;
using System.Text.Json;
using TaskManagement.Domain.Exceptions;
using FluentValidation;

namespace TaskManagement.API.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested)
        {
            // Client disconnected or cancelled the request — not an application error.
            _logger.LogInformation("Request cancelled by client for {Method} {Path}",
                context.Request.Method, context.Request.Path);

            // 499 is the de-facto "Client Closed Request" status (nginx convention).
            // Many clients ignore the body on cancellation, so we just set the code.
            if (!context.Response.HasStarted)
                context.Response.StatusCode = 499;
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        // Map each exception type to the appropriate HTTP status code and message.
        var (statusCode, message) = exception switch
        {
            // 404 — entity not found
            NotFoundException nfe =>
                (HttpStatusCode.NotFound, nfe.Message),

            // 422 — business rule violation (invalid status transition)
            InvalidStatusTransitionException iste =>
                (HttpStatusCode.UnprocessableEntity, iste.Message),

            // 400 — FluentValidation failures
            ValidationException ve =>
                (HttpStatusCode.BadRequest, string.Join("; ", ve.Errors.Select(e => e.ErrorMessage))),

            // 409 — general domain conflicts (e.g. duplicate email)
            DomainException de =>
                (HttpStatusCode.Conflict, de.Message),

            // 500 — unexpected errors (log full details, hide internals from client)
            _ =>
                (HttpStatusCode.InternalServerError, "An unexpected error occurred.")
        };

        // Log at the appropriate level — 5xx as Error, 4xx as Warning.
        if (statusCode == HttpStatusCode.InternalServerError)
            _logger.LogError(exception, "Unhandled exception for {Method} {Path}",
                context.Request.Method, context.Request.Path);
        else
            _logger.LogWarning(exception, "Handled exception {StatusCode} for {Method} {Path}",
                (int)statusCode, context.Request.Method, context.Request.Path);
        
        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/json";

        // Return a consistent error envelope so clients always parse the same shape.
        var response = new
        {
            status = (int)statusCode,
            error = message,
            path = context.Request.Path.Value
        };

        await context.Response.WriteAsync(
            JsonSerializer.Serialize(response, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
    }
}