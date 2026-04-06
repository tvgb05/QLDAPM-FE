import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  post<TResponse>(path: string, body: unknown): Observable<TResponse> {
    return this.http.post<TResponse>(this.buildUrl(path), body);
  }

  get<TResponse>(path: string): Observable<TResponse> {
    return this.http.get<TResponse>(this.buildUrl(path));
  }

  put<TResponse>(path: string, body: unknown): Observable<TResponse> {
    return this.http.put<TResponse>(this.buildUrl(path), body);
  }

  delete<TResponse>(path: string): Observable<TResponse> {
    return this.http.delete<TResponse>(this.buildUrl(path));
  }

  private buildUrl(path: string): string {
    const normalizedBaseUrl = this.apiBaseUrl.replace(/\/+$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${normalizedBaseUrl}${normalizedPath}`;
  }
}
