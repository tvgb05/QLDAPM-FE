import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { ApiResponse } from '../models/api-response.model';
import { AuthResponse } from '../models/auth-response.model';
import { LoginRequest } from '../models/login-request.model';
import { AppRole } from '../models/ui.models';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly loginPath = '/AppUser/login';
  private readonly storageKey = 'auth_user';
  private readonly currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  private readonly currentRoleSubject = new BehaviorSubject<AppRole>('student');

  readonly currentUser$ = this.currentUserSubject.asObservable();
  readonly currentRole$ = this.currentRoleSubject.asObservable();

  constructor(private readonly apiService: ApiService) {
    this.restoreAuthState();
  }

  login(payload: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.apiService.post<ApiResponse<AuthResponse>>(this.loginPath, {
      userName: payload.userName,
      password: payload.password,
    });
  }

  setAuthState(user: AuthResponse): void {
    const normalizedUser = this.normalizeUser(user);
    this.currentUserSubject.next(normalizedUser);
    this.currentRoleSubject.next(this.mapUserTypeToRole(normalizedUser.userType));
    localStorage.setItem(this.storageKey, JSON.stringify(normalizedUser));
  }

  getCurrentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  getCurrentRole(): AppRole {
    return this.currentRoleSubject.value;
  }
  
  setRole(role: AppRole): void {
    this.currentRoleSubject.next(role);
  }

  getRedirectUrl(userType: number): string {
    if (userType === 3) {
      return '/pdt';
    }
    // Student (1) or Lecturer (2)
    if (userType === 1 || userType === 2) {
      return '/dashboard';
    }
    return '/dashboard'; // Default fallback
  }

  logout(): void {
    this.currentUserSubject.next(null);
    this.currentRoleSubject.next('student');
    localStorage.removeItem(this.storageKey);
  }

  private mapUserTypeToRole(userType: number): AppRole {
    if (userType === 2) return 'lecturer';
    if (userType === 3) return 'pdt';
    return 'student';
  }

  private restoreAuthState(): void {
    const rawValue = localStorage.getItem(this.storageKey);
    if (!rawValue) {
      return;
    }

    try {
      const parsedUser = JSON.parse(rawValue) as Partial<AuthResponse>;
      if (!parsedUser.id || parsedUser.userType == null) {
        localStorage.removeItem(this.storageKey);
        return;
      }

      this.setAuthState({
        id: parsedUser.id,
        userName: parsedUser.userName ?? null,
        userType: parsedUser.userType,
        fullName: parsedUser.fullName ?? null,
        email: parsedUser.email ?? null,
      });
    } catch {
      localStorage.removeItem(this.storageKey);
    }
  }

  private normalizeUser(user: AuthResponse): AuthResponse {
    return {
      id: user.id,
      userName: user.userName ?? null,
      userType: user.userType,
      fullName: user.fullName ?? null,
      email: user.email ?? null,
    };
  }
}
