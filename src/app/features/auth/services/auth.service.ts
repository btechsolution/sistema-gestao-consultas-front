import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = 'http://localhost:8082/autenticacao/login';

  constructor(private http: HttpClient) {}

  login(dados: any) {
    return this.http.post<any>(this.API_URL, dados).pipe(
      tap(res => {
        const token = (typeof res === 'object' && res.token) ? res.token : res;
        if (token) {
          localStorage.setItem('token', token.toString().replace(/"/g, ''));
        }
      })
    );
  }
}