var builder = WebApplication.CreateBuilder(args);
builder.Services.AddProblemDetails();
var app = builder.Build();
app.UseExceptionHandler();
app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "ShiftLedger.Api", milestone = "foundation", databaseConfigured = false }));
app.MapGet("/", () => Results.Ok(new { name = "ShiftLedger API", description = "Business endpoints will be enabled with authentication and PostgreSQL persistence." }));
app.Run();
