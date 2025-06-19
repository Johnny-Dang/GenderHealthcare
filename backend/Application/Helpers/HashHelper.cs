using System.Security.Cryptography;
using System.Text;

namespace DeployGenderSystem.Application.Helpers
{
    public class HashHelper
    {
        public static string BCriptHash(string input)
        {
            return BCrypt.Net.BCrypt.HashPassword(input);
        }

        public static bool BCriptVerify(string input, string hash)
        {
            // Check if the hash is a valid BCrypt hash (starts with $2a$, $2b$, or $2y$)
            if (hash.StartsWith("$2a$") || hash.StartsWith("$2b$") || hash.StartsWith("$2y$"))
            {
                try
                {
                    return BCrypt.Net.BCrypt.Verify(input, hash);
                }
                catch (BCrypt.Net.SaltParseException)
                {
                    // If BCrypt verification fails due to invalid salt, fallback to direct comparison
                    return input == hash;
                }
            }
            else
            {
                // For backward compatibility with plain text passwords
                return input == hash;
            }
        }

        public static string GenerateRamdomString(int length)
        {
            StringBuilder s = new StringBuilder();
            var ramdom = new Random();

            for (int i = 0; i < length; i++)
            {
                s.Append((char)ramdom.Next('a', 'z'));
            }
            return s.ToString();
        }

        public static string Hash256(string input)
        {
            byte[] hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));
            string hash = Convert.ToHexString(hashBytes);
            return hash;
        }
    }
}
