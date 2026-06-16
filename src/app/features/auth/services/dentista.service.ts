import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DentistaService {
  private apiUrl = 'http://localhost:8082/dentistas';

  constructor(private http: HttpClient) {}

  listar(): Observable<any> {
    
    return this.http.get(this.apiUrl);
  }
}