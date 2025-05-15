using System.Security.Cryptography;
using System.Text;

namespace EventBooking.Service.Utilities;

public static class AesEncryption
{
	private static readonly byte[] _staticKey = Encoding.UTF8.GetBytes("0123456789ABCDEF0123456789ABCDEF");
	private static readonly byte[] _staticIV = Encoding.UTF8.GetBytes("n42h890zhs2460qb");

	public static string Encrypt(string plainText)
	{
		if (string.IsNullOrEmpty(plainText))
			throw new ArgumentNullException(nameof(plainText));

		using (var aes = Aes.Create())
		{
			aes.Key = _staticKey;
			aes.IV = _staticIV;

			ICryptoTransform encryptor = aes.CreateEncryptor(aes.Key, aes.IV);

			using (MemoryStream ms = new MemoryStream())
			{
				using (CryptoStream cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
				{
					using (StreamWriter sw = new StreamWriter(cs))
					{
						sw.Write(plainText);
					}
				}

				byte[] encryptedContent = ms.ToArray();
				byte[] result = new byte[_staticIV.Length + encryptedContent.Length];
				Array.Copy(_staticIV, 0, result, 0, _staticIV.Length);
				Array.Copy(encryptedContent, 0, result, _staticIV.Length, encryptedContent.Length);

				return Convert.ToBase64String(result);
			}
		}
	}

	public static string Decrypt(string cipherText)
	{
		if (string.IsNullOrEmpty(cipherText))
			throw new ArgumentNullException(nameof(cipherText));

		byte[] fullCipher = Convert.FromBase64String(cipherText);

		using (Aes aes = Aes.Create())
		{
			byte[] iv = new byte[16];
			byte[] cipher = new byte[fullCipher.Length - iv.Length];

			Array.Copy(fullCipher, iv, iv.Length);
			Array.Copy(fullCipher, iv.Length, cipher, 0, cipher.Length);

			aes.Key = _staticKey;
			aes.IV = iv;

			ICryptoTransform decryptor = aes.CreateDecryptor(aes.Key, aes.IV);

			using (MemoryStream ms = new MemoryStream(cipher))
			{
				using (CryptoStream cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read))
				{
					using (StreamReader sr = new StreamReader(cs))
					{
						return sr.ReadToEnd();
					}
				}
			}
		}
	}

}
