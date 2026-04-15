using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TrainerHub.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddMealPrograms : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MealPrograms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CoachId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MealPrograms", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MealPrograms_Users_CoachId",
                        column: x => x.CoachId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MealDays",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MealProgramId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MealDays", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MealDays_MealPrograms_MealProgramId",
                        column: x => x.MealProgramId,
                        principalTable: "MealPrograms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MealProgramAssignments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MealProgramId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClientId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MealProgramAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MealProgramAssignments_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MealProgramAssignments_MealPrograms_MealProgramId",
                        column: x => x.MealProgramId,
                        principalTable: "MealPrograms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MealItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MealDayId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Calories = table.Column<int>(type: "int", nullable: true),
                    ProteinGrams = table.Column<decimal>(type: "decimal(8,2)", precision: 8, scale: 2, nullable: true),
                    CarbsGrams = table.Column<decimal>(type: "decimal(8,2)", precision: 8, scale: 2, nullable: true),
                    FatGrams = table.Column<decimal>(type: "decimal(8,2)", precision: 8, scale: 2, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Order = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MealItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MealItems_MealDays_MealDayId",
                        column: x => x.MealDayId,
                        principalTable: "MealDays",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MealDays_MealProgramId_Order",
                table: "MealDays",
                columns: new[] { "MealProgramId", "Order" });

            migrationBuilder.CreateIndex(
                name: "IX_MealItems_MealDayId_Order",
                table: "MealItems",
                columns: new[] { "MealDayId", "Order" });

            migrationBuilder.CreateIndex(
                name: "IX_MealProgramAssignments_ClientId",
                table: "MealProgramAssignments",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_MealProgramAssignments_MealProgramId",
                table: "MealProgramAssignments",
                column: "MealProgramId");

            migrationBuilder.CreateIndex(
                name: "IX_MealPrograms_CoachId",
                table: "MealPrograms",
                column: "CoachId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MealItems");

            migrationBuilder.DropTable(
                name: "MealProgramAssignments");

            migrationBuilder.DropTable(
                name: "MealDays");

            migrationBuilder.DropTable(
                name: "MealPrograms");
        }
    }
}
