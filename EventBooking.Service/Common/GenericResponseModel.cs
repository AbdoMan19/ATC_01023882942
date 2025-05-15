using OnCareEmergencyCard.Service.Utilities;

namespace OnCareEmergencyCard.Service;

public class GenericResponseModel<TResult> : BaseResponseModel
{
	protected GenericResponseModel(string message, IList<ErrorResponseModel> errorLists)
		: base(message, errorLists)
	{
		Type t = typeof(TResult);
		if (t.GetConstructor(Type.EmptyTypes) != null)
		{
			Data = Activator.CreateInstance<TResult>();
		}
	}

	protected GenericResponseModel(TResult data, string message)
		: base(message) => Data = data;

	public TResult Data { get; set; }

	public static GenericResponseModel<TResult> Success(TResult data)
		=> new(data, Constants.SuccessMessage);

	public static GenericResponseModel<TResult> Failure(string message, IList<ErrorResponseModel> errorLists)
		=> new(message, errorLists);

	public static GenericResponseModel<TResult> Failure(TResult data)
		=> new(data, Constants.FailureMessage);
}
