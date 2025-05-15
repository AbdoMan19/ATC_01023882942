using System.Reflection;

namespace EventBooking.Repository;

public static class AssemblyReference
{
	public static readonly Assembly Assembly = typeof(AssemblyReference).Assembly;
}
