import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  dadosLogin = {
    email: '',
    senha: ''
  };

  carregando: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  efetuarLogin() {
    this.carregando = true;
    
    this.http.post<any>('http://localhost:8082/autenticacao/login', this.dadosLogin)
      .subscribe({
        next: (resposta) => {
          
          localStorage.setItem('token', resposta.token);
          localStorage.setItem('perfil', resposta.perfil);
          
          
          localStorage.setItem('email', this.dadosLogin.email);
          
          
          this.router.navigate(['/dashboard']);
        },
        error: (erro) => {
          this.carregando = false;
          if (erro.status === 401) {
            alert('Atenção: E-mail ou senha incorretos.');
          } else {
            alert('Erro de conexão com o servidor. Tente novamente mais tarde.');
          }
        }
      });
  }
}