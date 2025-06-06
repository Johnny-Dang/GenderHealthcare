using System.Text;

namespace DeployGenderSystem.Application.Helpers
{
    public static class HashHelper
    {
        public static string BCriptHash(string input)
        {
            return BCrypt.Net.BCrypt.HashPassword(input);
        }

        public static bool BCriptVerify(string input, string hash)
        {
            return BCrypt.Net.BCrypt.Verify(input, hash);
        }

        public static string GenerateRamdomString(int length)
        {
            StringBuilder s = new StringBuilder();
            var ramdom = new Random();

            for (int i = 0; i < length; i++)
            {
                s.Append((char)ramdom.Next(1, 255));
            }
            return s.ToString();
        }
    }
}
