namespace OnCareEmergencyCard.Service.Common;

public class SMSRequest
{
	public string Sender { get; set; }

	public string Message { get; set; }

	public string MobileNo { get; set; }

	public string ProviderName { get; set; }

	public string CountryCode { get; set; }
}
