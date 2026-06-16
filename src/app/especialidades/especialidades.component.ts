import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-especialidades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './especialidades.component.html',
  styleUrl: './especialidades.component.scss'
})
export class EspecialidadesComponent implements OnInit {
  especialidades: any[] = [];
  novaEspecialidade = { nome: '' };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.carregarEspecialidades();
  }

  carregarEspecialidades() {
    this.http.get<any[]>('http://localhost:8082/especialidades').subscribe({
      next: (dados) => this.especialidades = dados,
      error: (err) => console.error('Erro ao carregar especialidades', err)
    });
  }

  salvar() {
    if (!this.novaEspecialidade.nome || !this.novaEspecialidade.nome.trim()) {
      alert('Informe o nome da especialidade antes de cadastrar.');
      return;
    }

    this.http.post('http://localhost:8082/especialidades', this.novaEspecialidade).subscribe({
      next: () => {
        alert('Especialidade cadastrada!');
        this.novaEspecialidade.nome = '';
        this.carregarEspecialidades();
      },
      error: () => alert('Erro ao salvar especialidade.')
    });
  }

  excluir(id: number) {
    if (confirm('Deseja realmente excluir esta especialidade?')) {
      this.http.delete(`http://localhost:8082/especialidades/${id}`).subscribe({
        next: () => this.carregarEspecialidades(),
        error: () => alert('Não é possível excluir: existem dentistas vinculados a ela.')
      });
    }
  }
}