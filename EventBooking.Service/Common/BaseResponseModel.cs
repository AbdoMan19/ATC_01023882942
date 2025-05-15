namespace OnCareEmergencyCard.Service;

public class BaseResponseModel
{
	protected BaseResponseModel(string message)
	{
		Message = message;
		ErrorList = new List<ErrorResponseModel>();
	}

	protected BaseResponseModel(string message, IList<ErrorResponseModel> errorLists)
	{
		ErrorList = errorLists;
		Message = message;
	}

	public string Message { get; set; }

	public ICollection<ErrorResponseModel> ErrorList { get; set; }
}

public class ErrorResponseModel
{
	public string PropertyName { get; set; }

	public string Message { get; set; }

	public static ErrorResponseModel Create(string propertyName, string message)
		=> new()
		{
			PropertyName = propertyName,
			Message = message
		};
}
