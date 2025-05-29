using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data;

public partial class AppDbContext : DbContext
{
    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Assessment> Assessments { get; set; }
    public virtual DbSet<Course> Courses { get; set; }
    public virtual DbSet<Result> Results { get; set; }
    public virtual DbSet<UserModel> UserModels { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer(" Data Source=(localdb)\\MSSQLLocalDB;Initial Catalog=EduSync-LMS;Integrated Security=True;Connect Timeout=30;Encrypt=False;Trust Server Certificate=False;Application Intent=ReadWrite;Multi Subnet Failover=False");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Assessment>(entity =>
        {
            entity.ToTable("Assessment");

            entity.Property(e => e.AssessmentId).HasDefaultValueSql("(newsequentialid())");
            entity.Property(e => e.Title)
                .HasMaxLength(100)
                .IsUnicode(false);

            entity.HasOne(d => d.Course)
                .WithMany(p => p.Assessments)
                .HasForeignKey(d => d.CourseId)
                .HasConstraintName("FK_Assessment_Course1");
        });

        modelBuilder.Entity<Course>(entity =>
        {
            entity.ToTable("Course");

            entity.Property(e => e.CourseId).HasDefaultValueSql("(newsequentialid())");
            entity.Property(e => e.Description)
                .HasMaxLength(200)
                .IsUnicode(false);
            entity.Property(e => e.MediaUrl)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.Title)
                .HasMaxLength(100)
                .IsUnicode(false);

            entity.HasOne(d => d.Instructor).WithMany(p => p.Courses)
                .HasForeignKey(d => d.InstructorId)
                .HasConstraintName("FK_Course_UserModel");
        });

        modelBuilder.Entity<Result>(entity =>
        {
            entity.ToTable("Result");

            entity.Property(e => e.ResultId).HasDefaultValueSql("(newsequentialid())");
            entity.Property(e => e.AttemptDate).HasColumnType("datetime");

            entity.HasOne(d => d.Assessment).WithMany(p => p.Results)
                .HasForeignKey(d => d.AssessmentId)
                .HasConstraintName("FK_Result_Assessment");

            entity.HasOne(d => d.User).WithMany(p => p.Results)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_Result_UserModel");
        });

        modelBuilder.Entity<UserModel>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK_UserModel_1");

            entity.ToTable("UserModel");

            entity.HasIndex(e => e.Email, "UQ_UserModel_Email").IsUnique();

            entity.Property(e => e.UserId).HasDefaultValueSql("(newsequentialid())");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.PasswordHash)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Role)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
