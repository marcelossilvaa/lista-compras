import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User } from '../services/shopping-list.service';

@Injectable({
  providedIn: 'root'
})
export class AuthFormService {

  private usersUrl = 'http://localhost:3000/users';
  private currentUser: User | null = null;

  constructor(private http: HttpClient) { }

  /**
   * @param username 
   * @param password 
   * @returns 
   */
  login(username: string, password: string): Observable<boolean> {
    const params = new HttpParams()
      .set('username', username)
      .set('password', password);

    return this.http.get<User[]>(this.usersUrl, { params }).pipe(
      map(users => {
        if (users.length > 0) {
          this.currentUser = users[0];
          return true;
        }
        return false;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Erro no login:', error);
        return of(false);
      })
    );
  }


  logout(): void {
    this.currentUser = null;
  }


  getUserName(): string | null {
    return this.currentUser ? this.currentUser.name : null;
  }

  getUserEmail(): string | null {
    return this.currentUser ? this.currentUser.email : null;
  }


  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }
}
