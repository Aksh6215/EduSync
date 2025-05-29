namespace backend.DTO
{
    public class AssessmentDTO
    {
        public Guid AssessmentId { get; set; }

        public Guid? CourseId { get; set; }

        public string? Title { get; set; }

        public string? Questions { get; set; }

        // public List<QuestionDTO>? Questions { get; set; }

        public int? MaxScore { get; set; }
    }
}
