import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private mockUsers: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'user'
    }
  ];

  constructor() {}

  getUsers(): Observable<User[]> {
    return of(this.mockUsers);
  }

  getUserById(id: string): Observable<User | undefined> {
    return of(this.mockUsers.find(user => user.id === id));
  }
} 