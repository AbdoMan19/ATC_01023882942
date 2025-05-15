using System.Data;
using EventBooking.Repository.GenericRepository;


namespace EventBooking.UnitOfWork;

public interface IUnitOfWork : IDisposable
{
	Task<int> SaveChanges();

	IGenericRepository<TEntity> Repository<TEntity>()
		where TEntity : class;

	Task BeginTransactionAsync(IsolationLevel isolationLevel);

	Task CommitTransactionAsync();

	Task RollbackTransactionAsync();
}
