// Event filter models for API requests
export enum AvailabilityFilter {
  All = 'All',
  Available = 'Available',
  AlmostFull = 'AlmostFull'
}

export enum SortBy {
  Date = 'Date',
  Price = 'Price',
  Name = 'Name'
}

export class EventFilterDto {
  // Search term
  searchTerm?: string;
  
  // Category filters
  category?: string;
  
  // Date range
  startDate?: Date;
  endDate?: Date;
  
  // Price range
  minPrice?: number;
  maxPrice?: number;
  
  // Availability filters
  availability: AvailabilityFilter = AvailabilityFilter.All;
  
  // Sorting options
  sortBy: SortBy = SortBy.Date;
  ascending: boolean = false;
  
  // Pagination
  pageNumber: number = 1;
  pageSize: number = 6;

  constructor(init?: Partial<EventFilterDto>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
