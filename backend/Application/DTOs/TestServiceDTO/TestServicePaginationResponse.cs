namespace backend.Application.DTOs.ServiceDTO
{
    public class TestServicePaginationResponse
    {
        public List<TestServiceResponse> Items { get; set; } = new List<TestServiceResponse>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
        public bool HasPreviousPage => PageNumber > 1;
        public bool HasNextPage => PageNumber < TotalPages;
    }
} 