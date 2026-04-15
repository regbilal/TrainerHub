using System.ComponentModel.DataAnnotations;

namespace TrainerHub.Domain.Entities;

public class ErrorLog
{
    public Guid Id { get; set; }

    public DateTime OccurredAt { get; set; }

    [MaxLength(500)]
    public string? RequestPath { get; set; }

    [MaxLength(10)]
    public string? HttpMethod { get; set; }

    public int? StatusCode { get; set; }

    [MaxLength(512)]
    public string? ExceptionType { get; set; }

    [MaxLength(2000)]
    public string? Message { get; set; }

    public string? StackTrace { get; set; }

    [MaxLength(2000)]
    public string? InnerExceptionMessage { get; set; }

    public Guid? UserId { get; set; }

    [MaxLength(64)]
    public string? ClientIpAddress { get; set; }

    public string? RequestBody { get; set; }

    [MaxLength(1000)]
    public string? QueryString { get; set; }
}
