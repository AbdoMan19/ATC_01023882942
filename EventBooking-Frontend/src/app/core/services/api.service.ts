import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  protected baseUrl = environment.apiUrl;

  constructor(protected http: HttpClient) {}

  protected get<T>(path: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}`, { params })
      .pipe(catchError(this.handleError));
  }

  protected post<T>(path: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body)
      .pipe(catchError(this.handleError));
  }

  protected put<T>(path: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${path}`, body)
      .pipe(catchError(this.handleError));
  }

  protected delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${path}`)
      .pipe(catchError(this.handleError));
  }

  protected patch<T>(path: string, body: any): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${path}`, body)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  protected createHttpParams(params: { [key: string]: any }): HttpParams {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });
    return httpParams;
  }
} 