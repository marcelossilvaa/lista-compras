import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface ShoppingListItem {
  id: number;
  title: string;
  userId: number;
  included: boolean;
}

export interface User {
  id: number;
  username: string;
  password?: string;
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {
  private apiUrl = 'http://localhost:3000/shoppingList';
  private usersUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) { }

  /**
   * 
   * @param userId 
   */
  getShoppingList(userId: number): Observable<ShoppingListItem[]> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<ShoppingListItem[]>(this.apiUrl, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * 
   * @param newItem 
   */
  addItem(newItem: ShoppingListItem): Observable<ShoppingListItem> {
    return this.http.post<ShoppingListItem>(this.apiUrl, newItem)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * 
   * @param updatedItem 
   */
  updateItem(updatedItem: ShoppingListItem): Observable<ShoppingListItem> {
    return this.http.put<ShoppingListItem>(`${this.apiUrl}/${updatedItem.id}`, updatedItem)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * 
   * @param id 
   */
  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * 
   * @param email 
   */
  getUserByEmail(email: string): Observable<User | undefined> {
    const params = new HttpParams().set('email', email);
    return this.http.get<User[]>(this.usersUrl, { params })
      .pipe(
        map(users => users[0]),
        catchError(this.handleError)
      );
  }

  /**
   * 
   * @param name 
   * @param email 
   */
  createUser(name: string, email: string): Observable<User> {
    const username = email.split('@')[0];
    const password = 'password123'; 

    const newUser = { username, password, name, email };
    return this.http.post<User>(this.usersUrl, newUser)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * 
   * @param error
   */
  private handleError(error: HttpErrorResponse) {
    console.error('Ocorreu um erro:', error);
    return throwError('Algo deu errado; por favor, tente novamente mais tarde.');
  }
}
