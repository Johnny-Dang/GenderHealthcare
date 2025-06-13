namespace backend.Application.Interfaces
{
    public interface IVerificationCodeService
    {
        /// <summary>
        /// Tạo mã xác thực mới cho email
        /// </summary>
        /// <param name="email">Email cần xác thực</param>
        /// <returns>Mã xác thực</returns>
        string GenerateVerificationCode(string email);
        
        /// <summary>
        /// Kiểm tra mã xác thực có hợp lệ không
        /// </summary>
        /// <param name="email">Email đã đăng ký</param>
        /// <param name="code">Mã xác thực</param>
        /// <returns>True nếu mã hợp lệ, ngược lại là false</returns>
        bool VerifyCode(string email, string code);

        void RemoveCode(string email);
    }
} 