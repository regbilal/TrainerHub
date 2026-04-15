namespace TrainerHub.Application.DTOs;

public record ReviewDto(
    Guid Id,
    Guid ReviewerUserId,
    string ReviewerName,
    Guid RevieweeUserId,
    string RevieweeName,
    int Rating,
    string Comment,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public record CreateReviewDto(
    Guid ClientRelationshipId,
    int Rating,
    string Comment);
