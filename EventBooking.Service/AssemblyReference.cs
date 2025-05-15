using System.Reflection;

namespace EventBooking.Service;

public static class AssemblyReference
{
	public static readonly Assembly Assembly = typeof(AssemblyReference).Assembly;
}
