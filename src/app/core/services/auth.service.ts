import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenPayload, User, LoginResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initCurrentUser();
  }

  private initCurrentUser(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        this.currentUserSubject.next(JSON.parse(userStr));
      } catch (e) {
        this.logout();
      }
    }
  }

  /* 
    This function is used to check if the email is already exists.
  */
  checkEmail(email: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/auth/check-email`, { email });
  }

  signUp(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, userData);
  }

  /* s
    This function is used to login the user.
    It does NOT return data directly — it returns a stream
    👉 Angular HttpClient always returns an Observable
  */
  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((response) => {
        if (response && response.access_token) {
          localStorage.setItem('token', response.access_token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user); //Update App State, 👉 This is the real power
        }
      })
    );
  }

  googleLogin(idToken: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/google`, { idToken }).pipe(
      tap((response) => {
        if (response && response.access_token) {
          localStorage.setItem('token', response.access_token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  /* 
    This function is used by the authGuard to verify if the user is authenticated
    and if the token is valid from backend.
  */
  verifyToken(token: string): Observable<TokenPayload> {
    return this.http.post<TokenPayload>(`${this.apiUrl}/auth/verify`, { token });
  }

  /* 
    This function is used to remove the token and user from localStorage
    and update the currentUserSubject to null.
  */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  /* 
    This function is used to get the current user value.
  */
  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/reset-password`, data);
  }
}
