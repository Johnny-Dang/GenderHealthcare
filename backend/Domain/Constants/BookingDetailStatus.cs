namespace backend.Domain.Constants
{
    public static class BookingDetailStatus
    {
        public const string Pending = "Chưa xét nghiệm";
        public const string Tested = "Đã xét nghiệm";
        public const string ResultReady = "Đã có kết quả";
        public const string Missed = "Không đến xét nghiệm";
    }
}
