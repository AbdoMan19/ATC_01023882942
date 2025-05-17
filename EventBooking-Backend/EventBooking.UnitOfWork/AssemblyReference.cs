using System.Reflection;

namespace EventBooking.UnitOfWork;

public static class AssemblyReference
{
    public static readonly Assembly Assembly = typeof(AssemblyReference).Assembly;
}
