namespace backend.Application.DTOs.ServiceDTO
{
    public class TestServicePaginationRequest
    {
        private int _pageNumber = 1;
        private int _pageSize = 10;
        
        public int PageNumber
        {
            get => _pageNumber;
            set => _pageNumber = value < 1 ? 1 : value;
        }
        
        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = value < 1 ? 10 : (value > 100 ? 100 : value);
        }
        
        public string SearchTerm { get; set; } = string.Empty;
        public string SortBy { get; set; } = "ServiceName";
        public bool Ascending { get; set; } = true;
        public string? Category { get; set; }
    }
} 