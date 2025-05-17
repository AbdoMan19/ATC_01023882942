export interface ValidationError {
  propertyName: string;
  message: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  errorList: ValidationError[];
} 