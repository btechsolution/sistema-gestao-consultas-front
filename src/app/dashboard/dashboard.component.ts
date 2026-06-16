import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, AfterViewInit {
  abaAtiva: string = 'inicio';
  userRole: string = '';
  userEmail: string = '';
  editando: boolean = false;

  dentistaLogadoDados: any = null;

  chartVisaoGeralInstance: any;
  chartFinanceiroInstance: any;

  termoBuscaPaciente: string = '';
  termoBuscaDentista: string = '';
  termoBuscaEspecialidade: string = '';
  termoBuscaReceita: string = '';
  termoBuscaConsulta: string = '';
  termoBuscaUsuario: string = '';

  exibirModalProntuario = false;
  pacienteSelecionadoProntuario: any = null;
  historicoConsultasPaciente: any[] = [];

  exibirModalDeclaracao = false;
  exibirModalReceita = false;

  dadosDeclaracao: any = {
    consultaId: null,
    pacienteId: null,
    data: '',
    horarioInicio: '',
    horarioFim: ''
  };

  dadosReceita: any = { pacienteId: null, medicamento: '', posologia: '' };

  consultas: any[] = [];
  consultasFiltradas: any[] = [];
  consultasElegiveisDeclaracao: any[] = [];

  pacientes: any[] = [];
  pacientesParaReceita: any[] = [];
  dentistas: any[] = [];
  usuarios: any[] = [];
  lancamentosFinanceiros: any[] = [];
  especialidades: any[] = [];
  receitas: any[] = [];

  pacientesAtivosParaAgendamento: any[] = [];
  dentistasAtivosParaAgendamento: any[] = [];


  paginas = {
    pacientes:      { atual: 0, totalElementos: 0, totalPaginas: 0, limite: 10 },
    dentistas:      { atual: 0, totalElementos: 0, totalPaginas: 0, limite: 10 },
    especialidades: { atual: 0, totalElementos: 0, totalPaginas: 0, limite: 10 },
    usuarios:       { atual: 0, totalElementos: 0, totalPaginas: 0, limite: 10 },
    consultas:      { atual: 0, totalElementos: 0, totalPaginas: 0, limite: 10 },
    receitas:       { atual: 0, totalElementos: 0, totalPaginas: 0, limite: 10 },
    financeiro:     { atual: 0, totalElementos: 0, totalPaginas: 0, limite: 10 }
  };

  resumo: any = { totalPacientes: 0, consultasHoje: 0, saldoMensal: 0, totalDentistas: 0 };
  totalEntradas: number = 0;
  totalSaidas: number = 0;

  diasCalendario: any[] = [];
  mesAtual: Date = new Date();
  dataSelecionadaFiltro: string | null = null;

  dataMinima: string = '';
  dataMaxima: string = '';

  feriadosNacionais: string[] = [
    '01-01', '04-21', '05-01', '09-07', '10-12', '11-02', '11-15', '11-20', '12-25',
  ];

  exibirModalPaciente = false;
  exibirModalConsulta = false;
  exibirModalDentista = false;
  exibirModalUsuario = false;
  exibirModalEspecialidade = false;
  exibirModalFinanceiro = false;

  modalStatus = { visivel: false, tipoTarget: '', idTarget: 0, acaoAtivo: false, justificativa: '', erro: '' };

  modalSucesso = { visivel: false, margin: null as any, mensagem: '' };
  modalErro = { visivel: false, titulo: 'Erro', mensagem: '' };
  modalConfirmacao = { visivel: false, titulo: '', margin: '', mensagem: '', acaoConfirmar: () => {} };
  modalCancelamento = { visivel: false, consulta: null as any, motivo: '', erro: '' };

  errosConsulta: any = { dataInicio: '', dataFim: '', agenda: '' };

  novoPaciente: any = { id: null, nome: '', email: '', cpf: '', telefone: '', ativo: true };
  novaConsulta: any = {
    id: null,
    procedimentosSelecionados: [] as string[],
    descricao: '',
    dataInicio: '',
    dataFim: '',
    paciente: { id: null },
    dentista: { id: null }
  };
  novoDentista: any = { id: null, nome: '', cro: '', cpf: '', email: '', especialidades: '', ativo: true };
  novoUsuario: any = { id: null, nome: '', email: '', perfil: 'DENTISTA', senha: '' };
  novaEspecialidade: any = { id: null, nome: '' };
  novoLancamento: any = { id: null, descricao: '', valor: null, tipo: 'ENTRADA', paciente: { id: null }, consultaId: null }; 

  catalogoServicos: any = {
    'Clínica Geral': ['Limpeza Profissional', 'Restauração Resina', 'Consulta de Avaliação'],
    'Dentística': ['Clareamento a Laser', 'Lente de Contato Dental'],
    'Ortodontia': ['Manutenção Mensal', 'Instalação Aparelho'],
    'Implantodontia': ['Implante Unitário', 'Enxerto Ósseo'],
    'Endodontia': ['Tratamento de Canal', 'Retratamento'],
    'Periodontia': ['Tratamento Gengivite', 'Raspagem'],
    'Cirurgia e Traumatologia': ['Extração Siso', 'Cirurgia Menor'],
    'Odontopediatria': ['Prevenção Infantil', 'Flúor'],
    'Prótese Dentária': ['Coroa Cerâmica', 'Prótese Total'],
    'Harmonização Orofacial': ['Aplicação Botox', 'Preenchimento'],
    'Radiologia': ['Panorâmica', 'Tomografia Cone'],
  };

  tabelaPrecos: any = {
    'Limpeza Profissional': 150.0, 'Restauração Resina': 200.0, 'Consulta de Avaliação': 100.0,
    'Clareamento a Laser': 400.0, 'Lente de Contato Dental': 800.0, 'Manutenção Mensal': 120.0,
    'Instalação Aparelho': 500.0, 'Implante Unitário': 1500.0, 'Enxerto Ósseo': 800.0,
    'Tratamento de Canal': 600.0, 'Retratamento': 800.0, 'Tratamento Gengivite': 150.0,
    'Raspagem': 200.0, 'Extração Siso': 350.0, 'Cirurgia Menor': 400.0, 'Prevenção Infantil': 150.0,
    'Flúor': 100.0, 'Coroa Cerâmica': 900.0, 'Prótese Total': 1200.0, 'Aplicação Botox': 1000.0,
    'Preenchimento': 1200.0, 'Panorâmica': 100.0, 'Tomografia Cone': 250.0,
  };

  servicosFiltrados: string[] = [];
  valorSugeridoAtual: number = 0;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit(): void {
    this.userRole = localStorage.getItem('perfil') || 'RECEPCAO';
    this.userEmail = localStorage.getItem('email') || '';
    this.carregarDados();
    this.calcularLimitsData();
  }

  ngAfterViewInit(): void {
    if (this.abaAtiva === 'inicio') setTimeout(() => this.inicializarGraficos(), 500);
  }

  // ===== BUSCAS =====

  get pacientesBuscados() {
    // A paginação e filtro por termo de busca
    let pacientesFiltrados = this.pacientes;

    if (this.termoBuscaPaciente.trim()) {
      const termo = this.termoBuscaPaciente.toLowerCase();
      pacientesFiltrados = this.pacientes.filter(p => p.nome.toLowerCase().includes(termo));
    }

    const cfg = this.paginas.pacientes;
    cfg.totalElementos = pacientesFiltrados.length;
    cfg.totalPaginas = Math.ceil(cfg.totalElementos / cfg.limite) || 1;

    const inicio = cfg.atual * cfg.limite;
    const fim = inicio + cfg.limite;
    return pacientesFiltrados.slice(inicio, fim);
  }

  get dentistasBuscados() {
    if (!this.termoBuscaDentista.trim()) return this.dentistas;
    const termo = this.termoBuscaDentista.toLowerCase();
    return this.dentistas.filter(d => d.nome.toLowerCase().includes(termo));
  }

  get especialidadesBuscadas() {
    if (!this.termoBuscaEspecialidade.trim()) return this.especialidades;
    const termo = this.termoBuscaEspecialidade.toLowerCase();
    return this.especialidades.filter(e => e.nome.toLowerCase().includes(termo));
  }

  get receitasBuscadas() {
    if (!this.termoBuscaReceita.trim()) return this.receitas;
    const termo = this.termoBuscaReceita.toLowerCase();
    return this.receitas.filter(r => r.pacienteNome?.toLowerCase().includes(termo));
  }

  get usuariosBuscados() {
    if (!this.termoBuscaUsuario.trim()) return this.usuarios;
    const termo = this.termoBuscaUsuario.toLowerCase();
    return this.usuarios.filter(u =>
      (u.nome || '').toLowerCase().includes(termo) ||
      (u.email || '').toLowerCase().includes(termo) ||
      (u.perfil || '').toLowerCase().includes(termo)
    );
  }

  get consultasPaginadas() {
    const base = this.consultasFiltradas;
    const filtradas = !this.termoBuscaConsulta.trim()
      ? base
      : base.filter(c => {
          const termo = this.termoBuscaConsulta.toLowerCase();
          const paciente = c.paciente?.nome?.toLowerCase() || '';
          const dentista = c.dentista?.nome?.toLowerCase() || '';
          const descricao = c.descricao?.toLowerCase() || '';
          return paciente.includes(termo) || dentista.includes(termo) || descricao.includes(termo);
        });

    const cfg = this.paginas.consultas;
    cfg.totalElementos = filtradas.length;
    cfg.totalPaginas = Math.ceil(cfg.totalElementos / cfg.limite) || 1;
    const inicio = cfg.atual * cfg.limite;
    const fim = inicio + cfg.limite;
    return filtradas.slice(inicio, fim);
  }

  get receitasPaginadas() {
    const cfg = this.paginas.receitas;
    const inicio = cfg.atual * cfg.limite;
    const fim = inicio + cfg.limite;
    return this.receitasBuscadas.slice(inicio, fim);
  }

  get financeiroPaginado() {
    const cfg = this.paginas.financeiro;
    const inicio = cfg.atual * cfg.limite;
    const fim = inicio + cfg.limite;
    return this.lancamentosFinanceiros.slice(inicio, fim);
  }

  // ===== MÁSCARAS =====

  aplicarMascaraCPF(event: any, contexto: 'paciente' | 'dentista') {
    let valor = event.target.value.replace(/\D/g, '');
    event.target.value = valor;

    if (valor.length > 11) valor = valor.substring(0, 11);

    valor = valor
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    if (contexto === 'paciente') this.novoPaciente.cpf = valor;
    if (contexto === 'dentista') this.novoDentista.cpf = valor;
  }

  aplicarMascaraTelefone(event: any) {
    let valor = event.target.value.replace(/\D/g, '');
    event.target.value = valor;

    if (valor.length > 11) valor = valor.substring(0, 11);

    valor = valor
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d)(\d{4})$/, '$1-$2');

    this.novoPaciente.telefone = valor;
  }

  aplicarMascaraCRO(event: any) {
    let valor = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (valor.length > 7) valor = valor.substring(0, 7);

    if (valor.length > 5) {
      const parteNumerica = valor.substring(0, 5).replace(/\D/g, '');
      const parteUF = valor.substring(5, 7).replace(/[^A-Z]/g, '');
      valor = parteNumerica + (parteUF ? '/' + parteUF : '');
    }
    this.novoDentista.cro = valor;
  }

  validarFormatoEmail(email: string): boolean {
    const regex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
    return regex.test(String(email).toLowerCase().trim());
  }

  // ===== PRONTUÁRIO / DECLARAÇÃO / RECEITAS =====

  abrirProntuario(paciente: any) {
    this.pacienteSelecionadoProntuario = paciente;
    this.historicoConsultasPaciente = this.consultas
      .filter(c => c.paciente?.id === paciente.id)
      .sort((a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime());
    this.exibirModalProntuario = true;
  }

  baixarProntuarioPDF() {
    if (!this.pacienteSelecionadoProntuario) return;
    this.http
      .get(`http://localhost:8082/relatorios/prontuario/${this.pacienteSelecionadoProntuario.id}`, {
        responseType: 'blob',
      })
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Prontuario_${this.pacienteSelecionadoProntuario.nome.replace(/\s+/g, '_')}.pdf`;
          a.click();
        },
        error: () => this.mostrarErro('Acesso Negado', 'Verifique as permissões de CORS e de Segurança no Back-end.'),
      });
  }

  abrirModalDeclaracaoComparecimento() {
    this.dadosDeclaracao = {
      consultaId: null,
      pacienteId: null,
      data: '',
      horarioInicio: '',
      horarioFim: ''
    };
    this.exibirModalDeclaracao = true;
  }

  preencherDadosDeclaracao(consultaId: number | null) {
    if (!consultaId) {
      this.dadosDeclaracao.pacienteId = null;
      this.dadosDeclaracao.data = '';
      this.dadosDeclaracao.horarioInicio = '';
      this.dadosDeclaracao.horarioFim = '';
      return;
    }

    const consulta = this.consultasElegiveisDeclaracao.find(c => c.id === consultaId);
    if (!consulta) return;

    const inicio = new Date(consulta.dataInicio);
    const fim = new Date(consulta.dataFim);

    const ano  = inicio.getFullYear();
    const mes  = String(inicio.getMonth() + 1).padStart(2, '0');
    const dia  = String(inicio.getDate()).padStart(2, '0');

    const hi_h = String(inicio.getHours()).padStart(2, '0');
    const hi_m = String(inicio.getMinutes()).padStart(2, '0');
    const hf_h = String(fim.getHours()).padStart(2, '0');
    const hf_m = String(fim.getMinutes()).padStart(2, '0');

    this.dadosDeclaracao.consultaId    = consulta.id;
    this.dadosDeclaracao.pacienteId    = consulta.paciente?.id;
    this.dadosDeclaracao.data          = `${ano}-${mes}-${dia}`;
    this.dadosDeclaracao.horarioInicio = `${hi_h}:${hi_m}`;
    this.dadosDeclaracao.horarioFim    = `${hf_h}:${hf_m}`;
  }

  gerarDeclaracaoPDF() {
    const { consultaId, pacienteId, data, horarioInicio, horarioFim } = this.dadosDeclaracao;

    if (!consultaId) {
      this.mostrarErro(
        'Seleção obrigatória',
        'Escolha uma consulta já realizada para emitir a declaração.'
      );
      return;
    }

    if (!pacienteId || !data || !horarioInicio || !horarioFim) {
      this.mostrarErro(
        'Dados Incompletos',
        'Para gerar a Declaração de Comparecimento, selecione uma consulta válida.'
      );
      return;
    }

    this.http
      .post('http://localhost:8082/relatorios/declaracao', this.dadosDeclaracao, { responseType: 'blob' })
      .subscribe((blob) => {
        this.exibirModalDeclaracao = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Declaracao_Comparecimento.pdf';
        a.click();
        this.mostrarSucesso('Declaração gerada com sucesso!');
      });
  }

  abrirModalNovaReceita(pacienteIdSelecionado: any = null) {
    this.atualizarPacientesParaReceita();
    this.dadosReceita = { pacienteId: pacienteIdSelecionado, medicamento: '', posologia: '' };
    this.exibirModalReceita = true;
  }

  salvarERenderizarReceita() {
    const { pacienteId, medicamento, posologia } = this.dadosReceita;

    if (!pacienteId || !medicamento?.trim() || !posologia?.trim()) {
      this.mostrarErro(
        'Dados Incompletos',
        'Preencha paciente, medicamento e a orientação de posologia antes de salvar e emitir a receita.'
      );
      return;
    }

    this.http.post('http://localhost:8082/receitas', this.dadosReceita).subscribe(() => {
      this.exibirModalReceita = false;
      this.carregarReceitas();
      this.mostrarSucesso('Receita salva no histórico!');

      this.http
        .post('http://localhost:8082/relatorios/receita-pdf', this.dadosReceita, { responseType: 'blob' })
        .subscribe((blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'Receita_Odontologica.pdf';
          a.click();
        });
    });
  }

  baixarReceitaDaTabela(receita: any) {
    const payload = { pacienteId: receita.pacienteId, medicamento: receita.medicamento, posologia: receita.posologia };
    this.http
      .post('http://localhost:8082/relatorios/receita-pdf', payload, { responseType: 'blob' })
      .subscribe((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Receita_${receita.pacienteNome.replace(/\s+/g, '_')}.pdf`;
        a.click();
      });
  }

  carregarReceitas() {
    this.http.get<any[]>('http://localhost:8082/receitas').subscribe((res) => {
      this.receitas = res.sort((a, b) => b.id - a.id);
      const cfg = this.paginas.receitas;
      cfg.totalElementos = this.receitas.length;
      cfg.totalPaginas = Math.ceil(cfg.totalElementos / cfg.limite) || 1;
      cfg.atual = 0;
    });
  }

  // ===== FEEDBACK / DATAS =====

  calcularLimitsData() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    this.dataMinima = `${ano}-${mes}-${dia}T07:00`;
    this.dataMaxima = `${ano + 1}-${mes}-${dia}T18:00`;
  }

  mostrarSucesso(mensagem: string) {
    this.modalSucesso.mensagem = mensagem;
    this.modalSucesso.visivel = true;
    setTimeout(() => {
      this.modalSucesso.visivel = false;
    }, 2500);
  }

  mostrarErro(titulo: string, mensagem: string) {
    this.modalErro.titulo = titulo;
    this.modalErro.mensagem = mensagem;
    this.modalErro.visivel = true;
  }

  mostrarConfirmacao(titulo: string, mensagem: string, acao: () => void) {
    this.modalConfirmacao.titulo = titulo;
    this.modalConfirmacao.mensagem = mensagem;
    this.modalConfirmacao.acaoConfirmar = acao;
    this.modalConfirmacao.visivel = true;
  }

  abrirCancelamento(c: any) {
    this.modalCancelamento.consulta = c;
    this.modalCancelamento.motivo = '';
    this.modalCancelamento.erro = '';
    this.modalCancelamento.visivel = true;
  }

  // ===== CARREGAMENTO GERAL / PAGINAÇÃO =====

  carregarDados() {
    this.buscarDentistas();
    this.buscarEspecialidades();
    this.buscarUsuarios();
    this.buscarConsultasGerais();
    
  }

  buscarPacientes() {
    if (this.userRole === 'DENTISTA') {
      this.montarPacientesDoDentista();
      return;
    }


    const url = `http://localhost:8082/pacientes?page=0&size=1000`;
    this.http.get<any>(url).subscribe((res) => {
      this.pacientes = res.content || [];
      this.atualizarResumo();
      this.pacientesAtivosParaAgendamento = this.pacientes.filter(p => p.ativo);
    });
  }

  montarPacientesDoDentista() {
    const mapa = new Map<number, any>();

    this.consultas.forEach((c) => {
      const p = c.paciente;
      if (!p || p.id == null) return;

      if (p.ativo !== undefined && p.ativo === false) return;

      if (!mapa.has(p.id)) {
        mapa.set(p.id, {
          ...p,
          status: p.ativo ? 'ATIVO' : 'INATIVO',
        });
      }
    });

    this.pacientes = Array.from(mapa.values());


    this.paginas.pacientes.totalElementos = this.pacientes.length;
    this.paginas.pacientes.totalPaginas = Math.ceil(this.pacientes.length / this.paginas.pacientes.limite) || 1;
    this.paginas.pacientes.atual = 0;
    this.atualizarResumo();
    this.pacientesAtivosParaAgendamento = this.pacientes.filter(p => p.ativo);
  }

  atualizarPacientesParaReceita() {
    const mapa = new Map<number, any>();

    this.consultas
      .filter(c =>
        c.status === 'REALIZADA' &&
        c.dentista &&
        c.dentista.email?.toLowerCase() === this.userEmail.toLowerCase()
      )
      .forEach(c => {
        const p = c.paciente;
        if (!p || p.id == null) return;
        if (p.ativo !== undefined && p.ativo === false) return;

        if (!mapa.has(p.id)) {
          mapa.set(p.id, { ...p });
        }
      });

    this.pacientesParaReceita = Array.from(mapa.values());
  }

  buscarDentistas() {
    const url = `http://localhost:8082/dentistas?page=${this.paginas.dentistas.atual}&size=${this.paginas.dentistas.limite}`;
    this.http.get<any>(url).subscribe((res) => {
      const listaDentistas = res.content || [];
      this.dentistas = listaDentistas.sort((a: any, b: any) => a.id - b.id);
      this.paginas.dentistas.totalElementos = res.totalElements || 0;
      this.paginas.dentistas.totalPaginas = res.totalPages || 0;

      if (this.userRole === 'DENTISTA') {
        this.dentistaLogadoDados = this.dentistas.find(
          (dent) => dent.email?.toLowerCase() === this.userEmail.toLowerCase()
        );
      }

      this.atualizarResumo();
      this.dentistasAtivosParaAgendamento = this.dentistas.filter(d => d.ativo);
    });
  }

  buscarEspecialidades() {
    if (this.userRole === 'DENTISTA') return;
    const url = `http://localhost:8082/especialidades?page=${this.paginas.especialidades.atual}&size=${this.paginas.especialidades.limite}`;
    this.http.get<any>(url).subscribe((res) => {
      this.especialidades = res.content || [];
      this.paginas.especialidades.totalElementos = res.totalElements || 0;
      this.paginas.especialidades.totalPaginas = res.totalPages || 0;
    });
  }

  buscarUsuarios() {
    if (this.userRole !== 'ADMIN') return;
    const url = `http://localhost:8082/usuarios?page=${this.paginas.usuarios.atual}&size=${this.paginas.usuarios.limite}`;
    this.http.get<any>(url).subscribe((res) => {
      const listaUsuarios = res.content || [];
      this.usuarios = listaUsuarios.sort((a: any, b: any) => a.id - b.id);
      this.paginas.usuarios.totalElementos = res.totalElements || 0;
      this.paginas.usuarios.totalPaginas = res.totalPages || 0;
    });
  }

  buscarConsultasGerais() {
    const url = 'http://localhost:8082';
    this.carregarReceitas();
    this.http.get<any[]>(`${url}/consultas`).subscribe((d) => {
      let todasAsConsultas = d.sort(
        (a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime()
      );

      if (this.userRole === 'DENTISTA') {
        this.consultas = todasAsConsultas.filter((c) => c.dentista?.email === this.userEmail);
        this.montarPacientesDoDentista();
        this.atualizarPacientesParaReceita();
      } else {
        this.consultas = todasAsConsultas;
        this.buscarPacientes();
      }

      this.consultasElegiveisDeclaracao = this.consultas.filter(
        c => c.status === 'REALIZADA'
      );

      this.aplicarFiltroData();
      this.gerarCalendario();
      this.atualizarResumo();
    });

    if (this.userRole === 'ADMIN') {
      this.buscarFinanceiro(url);
    }
  }

  mudarPaginaFicha(
    target:
      | 'pacientes'
      | 'dentistas'
      | 'especialidades'
      | 'usuarios'
      | 'consultas'
      | 'receitas'
      | 'financeiro',
    direcao: number
  ) {
    const config = this.paginas[target];
    const novaPagina = config.atual + direcao;

    if (novaPagina >= 0 && novaPagina < config.totalPaginas) {
      config.atual = novaPagina;
      if (target === 'dentistas') this.buscarDentistas();
      if (target === 'especialidades') this.buscarEspecialidades();
      if (target === 'usuarios') this.buscarUsuarios();
    }
  }

  atualizarResumo() {
    const hojeStr = new Date().toISOString().split('T')[0];

    this.resumo.consultasHoje = this.consultas.filter(
      (c) => c.dataInicio && c.dataInicio.startsWith(hojeStr)
    ).length;

    this.resumo.totalPacientes = this.pacientes.length;
    this.resumo.totalDentistas = this.dentistas.filter((d: any) => d.ativo).length;

    this.cdr.detectChanges();
  }

  // ===== FINANCEIRO =====

  buscarFinanceiro(url: string) {
    this.http.get<any[]>(`${url}/financeiro`).subscribe((d) => {
      this.lancamentosFinanceiros = d.sort((a, b) => a.id - b.id);

      const cfg = this.paginas.financeiro;
      cfg.totalElementos = this.lancamentosFinanceiros.length;
      cfg.totalPaginas = Math.ceil(cfg.totalElementos / cfg.limite) || 1;
      cfg.atual = 0;

      this.calcularSaldoReal();
    });
  }

  calcularSaldoReal() {
    let entradasCalculadas = 0;
    let saidasCalculadas = 0;
    this.lancamentosFinanceiros.forEach((f) => {
      const valor = Number(f.valor) || 0;
      if (f.tipo === 'ENTRADA' && f.status === 'PAGO') entradasCalculadas += valor;
      if (f.tipo === 'SAIDA')   saidasCalculadas += valor;
    });

    this.totalEntradas = entradasCalculadas;
    this.totalSaidas = saidasCalculadas;
    this.resumo.saldoMensal = this.totalEntradas - this.totalSaidas;
    this.cdr.detectChanges();
    if (this.abaAtiva === 'inicio') this.inicializarGraficos();
  }

  // ===== FÉRIAS DO DENTISTA =====

  solicitarAlteracaoFerias() {
    if (!this.dentistaLogadoDados) return;
    const emFeriasAtual = this.dentistaLogadoDados.emFerias;

    if (!emFeriasAtual) {
      const temConsultasPendentes = this.consultas.some(
        (c) => c.dentista?.id === this.dentistaLogadoDados.id && c.status === 'AGENDADA'
      );
      if (temConsultasPendentes) {
        this.mostrarErro(
          'Ação Bloqueada',
          'Não é possível iniciar o período de férias pois existem consultas ativas marcadas na sua agenda.'
        );
        return;
      }
    }

    const titulo = emFeriasAtual ? 'Retorno de Férias' : 'Entrar em Férias';
    const msg = emFeriasAtual ? 'Deseja reativar sua agenda para marcações?' : 'Tem certeza que deseja entrar em férias?';

    this.mostrarConfirmacao(titulo, msg, () => {
      this.modalConfirmacao.visivel = false;
      const rotaEnd = emFeriasAtual ? 'retornar-ferias' : 'entrar-ferias';

      this.http
        .put(`http://localhost:8082/dentistas/${this.dentistaLogadoDados.id}/${rotaEnd}`, {})
        .subscribe({
          next: () => {
            this.carregarDados();
            this.mostrarSucesso(
              emFeriasAtual ? 'Retorno registrado! Grade liberada.' : 'Férias iniciadas com sucesso!'
            );
          },
          error: (err) =>
            this.mostrarErro('Erro operacional', err.error || 'Não foi possível atualizar seu status.'),
        });
    });
  }

  // ===== CALENDÁRIO / FILTRO POR DIA =====

  selecionarDataFiltro(diaObj: any) {
    if (!diaObj.numero || diaObj.inativo) return;
    this.dataSelecionadaFiltro =
      this.dataSelecionadaFiltro === diaObj.dataCompleta ? null : diaObj.dataCompleta;
    this.aplicarFiltroData();
  }

  limparFiltroData() {
    this.dataSelecionadaFiltro = null;
    this.aplicarFiltroData();
  }

  aplicarFiltroData() {
    if (!this.dataSelecionadaFiltro) {
      this.consultasFiltradas = [...this.consultas];
    } else {
      this.consultasFiltradas = this.consultas.filter(
        (c) => c.dataInicio.split('T')[0] === this.dataSelecionadaFiltro
      );
    }

    const cfg = this.paginas.consultas;
    cfg.totalElementos = this.consultasFiltradas.length;
    cfg.totalPaginas = Math.ceil(cfg.totalElementos / cfg.limite) || 1;
    cfg.atual = 0;
  }

  gerarCalendario() {
    const ano = this.mesAtual.getFullYear();
    const mes = this.mesAtual.getMonth();
    const primeiroDiaMes = new Date(ano, mes, 1).getDay();
    const totalDiasMes = new Date(ano, mes + 1, 0).getDate();
    const dias: any[] = [];

    for (let i = 0; i < primeiroDiaMes; i++)
      dias.push({ numero: '', temConsulta: false, inativo: true });

    for (let d = 1; d <= totalDiasMes; d++) {
      const dataVerificacaoStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const ehFimDeSemana =
        new Date(ano, mes, d).getDay() === 0 || new Date(ano, mes, d).getDay() === 6;
      const possuiConsulta = this.consultas.some((c) =>
        c.status === 'CANCELADA'
          ? false
          : c.dataInicio.split('T')[0] === dataVerificacaoStr
      );
      dias.push({
        numero: d,
        dataCompleta: dataVerificacaoStr,
        temConsulta: possuiConsulta,
        inativo: ehFimDeSemana,
      });
    }
    this.diasCalendario = dias;
  }

  mudarMes(direcao: number) {
    this.mesAtual = new Date(
      this.mesAtual.getFullYear(),
      this.mesAtual.getMonth() + direcao,
      1
    );
    this.gerarCalendario();
  }

  // ===== AGENDAMENTO / PROCEDIMENTOS =====

  filtrarProcedimentos() {
    const dr = this.dentistas.find((d) => d.id == this.novaConsulta.dentista.id);
    this.servicosFiltrados = [];

    if (dr && dr.especialidades && dr.especialidades.length > 0) {
      dr.especialidades.forEach((esp: any) => {
        const servicos = this.catalogoServicos[esp.nome] || [];
        this.servicosFiltrados = [...this.servicosFiltrados, ...servicos];
      });
      this.servicosFiltrados = [...new Set(this.servicosFiltrados)];
    }

    if (this.servicosFiltrados.length === 0) {
      this.servicosFiltrados = ['Consulta de Avaliação'];
    }
    this.novaConsulta.procedimentosSelecionados = [];
    this.novaConsulta.descricao = '';
    this.valorSugeridoAtual = 0;
  }

  atualizarValorProcedimento() {
    this.valorSugeridoAtual = 0;
    if (
      this.novaConsulta.procedimentosSelecionados &&
      this.novaConsulta.procedimentosSelecionados.length > 0
    ) {
      this.novaConsulta.procedimentosSelecionados.forEach((procedimento: string) => {
        this.valorSugeridoAtual += this.tabelaPrecos[procedimento] || 0;
      });
      this.novaConsulta.descricao = this.novaConsulta.procedimentosSelecionados.join(' + ');
    } else {
      this.novaConsulta.descricao = '';
    }
  }

  validarHorarioDigitado() {
    if (!this.novaConsulta.dataInicio) return;

    this.errosConsulta.dataInicio = '';
    const dataAgendamento = new Date(this.novaConsulta.dataInicio);
    const diaDaSemana = dataAgendamento.getDay();
    const horas = dataAgendamento.getHours();

    if (diaDaSemana === 0 || diaDaSemana === 6) {
      this.mostrarErro(
        'Horário Inválido',
        'A clínica não abre aos finais de semana (Sábado e Domingo).'
      );
      this.novaConsulta.dataInicio = '';
      this.novaConsulta.dataFim = '';
      return;
    }

    if (horas < 8 || horas >= 18) {
      this.mostrarErro(
        'Horário Inválido',
        'O horário de atendimento da clínica é estritamente das 08:00 às 18:00.'
      );
      this.novaConsulta.dataInicio = '';
      this.novaConsulta.dataFim = '';
      return;
    }

    const mesDiaStr = `${String(dataAgendamento.getMonth() + 1).padStart(2, '0')}-${String(
      dataAgendamento.getDate()
    ).padStart(2, '0')}`;
    if (this.feriadosNacionais.includes(mesDiaStr)) {
      this.mostrarErro(
        'Horário Inválido',
        'Não é possível agendar consultas em dias de feriado nacional.'
      );
      this.novaConsulta.dataInicio = '';
      this.novaConsulta.dataFim = '';
      return;
    }

    const dataFimCalculada = new Date(
      dataAgendamento.getTime() + 30 * 60 * 1000
    );

    const ano = dataFimCalculada.getFullYear();
    const mes = String(dataFimCalculada.getMonth() + 1).padStart(2, '0');
    const dia = String(dataFimCalculada.getDate()).padStart(2, '0');
    const h = String(dataFimCalculada.getHours()).padStart(2, '0');
    const m = String(dataFimCalculada.getMinutes()).padStart(2, '0');

    this.novaConsulta.dataFim = `${ano}-${mes}-${dia}T${h}:${m}`;
  }

  validarHorarioFinal() {
    if (!this.novaConsulta.dataInicio || !this.novaConsulta.dataFim) return;

    const inicio = new Date(this.novaConsulta.dataInicio).getTime();
    const fim = new Date(this.novaConsulta.dataFim).getTime();

    if (fim !== inicio + 30 * 60 * 1000) {
      this.mostrarErro(
        'Duração Inválida',
        'Atenção: A consulta deve ter a duração exata de 30 minutos.'
      );
      this.validarHorarioDigitado();
    }
  }

  inicializarGraficos() {
    if (this.chartVisaoGeralInstance) this.chartVisaoGeralInstance.destroy();
    if (this.chartFinanceiroInstance) this.chartFinanceiroInstance.destroy();

    const canvasGeral = document.getElementById('chartVisaoGeral') as HTMLCanvasElement;
    if (canvasGeral) {
      this.chartVisaoGeralInstance = new Chart(canvasGeral, {
        type: 'line',
        data: {
          labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
          datasets: [
            {
              label: 'Volume de Atendimentos Anual',
              data: [5, 12, 18, 25, 29, this.consultas.length, 0, 0, 0, 0, 0, 0],
              borderColor: '#1B4965',
              backgroundColor: 'rgba(27, 73, 101, 0.1)',
              fill: true,
              tension: 0.3,
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }

    const canvasFin = document.getElementById('chartFinanceiro') as HTMLCanvasElement;
    if (canvasFin && this.userRole === 'ADMIN') {
      this.chartFinanceiroInstance = new Chart(canvasFin, {
        type: 'doughnut',
        data: {
          labels: ['Entradas', 'Saídas'],
          datasets: [
            {
              data: [this.totalEntradas || 1, this.totalSaidas || 0],
              backgroundColor: ['#2ecc71', '#e74c3c'],
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '75%' },
      });
    }
  }

  // ===== STATUS (ATIVAR / DESATIVAR) =====

  abrirModalAlterarStatus(tipo: string, id: number, statusAtual: boolean) {
    const novoStatusAtivo = !statusAtual;

    if (!novoStatusAtivo) {
      let temPendencia = false;
      if (tipo === 'pacientes') {
        temPendencia = this.consultas.some(
          (c) => c.paciente?.id == id && c.status === 'AGENDADA'
        );
      } else if (tipo === 'dentistas') {
        temPendencia = this.consultas.some(
          (c) => c.dentista?.id == id && c.status === 'AGENDADA'
        );
      }

      if (temPendencia) {
        this.mostrarErro(
          'Bloqueio de Inativação',
          'Não é possível desativar este cadastro pois existem consultas AGENDADAS e ativas. Cancele-as ou finalize-as primeiro.'
        );
        return;
      }

      this.modalStatus = {
        visivel: true,
        tipoTarget: tipo,
        idTarget: id,
        acaoAtivo: false,
        justificativa: '',
        erro: '',
      };
    } else {
      this.http
        .put(`http://localhost:8082/${tipo}/${id}/alterar-status`, { ativo: true, justificativaStatus: null })
        .subscribe({
          next: () => {
            this.carregarDados();
            this.mostrarSucesso('Registro reativado com sucesso!');
          },
          error: () => this.mostrarErro('Erro', 'Não foi possível reativar o registro.'),
        });
    }
  }

  confirmarAlteracaoStatus() {
    if (!this.modalStatus.justificativa.trim()) {
      this.modalStatus.erro = 'A justificativa é obrigatória para realizar a desativação.';
      return;
    }
    const payload = { ativo: false, justificativaStatus: this.modalStatus.justificativa };
    this.http
      .put(
        `http://localhost:8082/${this.modalStatus.tipoTarget}/${this.modalStatus.idTarget}/alterar-status`,
        payload
      )
      .subscribe({
        next: () => {
          this.modalStatus.visivel = false;
          this.carregarDados();
          this.mostrarSucesso('Registro desativado no sistema.');
        },
      });
  }

  // ===== CRUD CONSULTA =====

  salvarConsulta() {
    this.errosConsulta = { dataInicio: '', dataFim: '', agenda: '' };

    if (
      !this.novaConsulta.dentista.id ||
      !this.novaConsulta.paciente.id ||
      !this.novaConsulta.descricao ||
      !this.novaConsulta.dataInicio ||
      !this.novaConsulta.dataFim
    ) {
      this.mostrarErro(
        'Atenção',
        'Preencha todos os campos do agendamento corretamente.'
      );
      return;
    }

    // --- Verificação: Paciente Ativo ---
    const pacienteSelecionado = this.pacientes.find(
      (p) => p.id === this.novaConsulta.paciente.id
    );
    if (pacienteSelecionado && !pacienteSelecionado.ativo) {
      const motivo = pacienteSelecionado.justificativaStatus ? `Motivo: ${pacienteSelecionado.justificativaStatus}` : 'Nenhum motivo informado.';
      this.mostrarErro(
        'Paciente Inativo',
        `Não é possível agendar consultas para o paciente ${pacienteSelecionado.nome}, pois ele está inativo. ${motivo}`
      );
      return;
    }

    
    const dentistaSelecionado = this.dentistas.find(
      (d) => d.id === this.novaConsulta.dentista.id
    );
    if (dentistaSelecionado && !dentistaSelecionado.ativo) {
      const motivo = dentistaSelecionado.justificativaStatus ? `Motivo: ${dentistaSelecionado.justificativaStatus}` : 'Nenhum motivo informado.';
      this.mostrarErro(
        'Dentista Inativo',
        `Não é possível agendar consultas para o dentista ${dentistaSelecionado.nome}, pois ele está inativo. ${motivo}`
      );
      return;
    }

    if (dentistaSelecionado?.emFerias) {
      this.mostrarErro(
        'Dentista em Férias',
        `Não é possível agendar consultas para o dentista ${dentistaSelecionado.nome} durante o período de férias.`
      );
      return;
    }

    const novoInicio = new Date(this.novaConsulta.dataInicio).getTime();
    const novoFim = new Date(this.novaConsulta.dataFim).getTime();
    const dataDesejadaStr = this.novaConsulta.dataInicio.split('T')[0];

    if (novoInicio < new Date().getTime()) {
      this.mostrarErro(
        'Data Inválida',
        'Não é permitido realizar agendamentos retroativos (no passado).'
      );
      return;
    }

    const pacienteCancelouNestaData = this.consultas.some(
      (c) =>
        c.paciente?.id == this.novaConsulta.paciente.id &&
        c.status === 'CANCELADA' &&
        c.dataInicio.split('T')[0] === dataDesejadaStr
    );

    if (pacienteCancelouNestaData) {
      this.mostrarErro(
        'Reagendamento Bloqueado',
        'O paciente teve uma consulta cancelada nesta data. Novas marcações para ele só são permitidas a partir do dia seguinte.'
      );
      return;
    }

    const conflitoDentista = this.consultas.some((c) => {
      if (c.status === 'CANCELADA' || c.dentista?.id != this.novaConsulta.dentista.id)
        return false;
      const extInicio = new Date(c.dataInicio).getTime();
      const extFim = new Date(c.dataFim).getTime();
      return novoInicio < extFim && novoFim > extInicio;
    });

    if (conflitoDentista) {
      this.mostrarErro(
        'Conflito de Agenda',
        'O profissional selecionado já possui um atendimento marcado neste exato horário.'
      );
      return;
    }

    const conflitoPaciente = this.consultas.some((c) => {
      if (c.status === 'CANCELADA' || c.paciente?.id != this.novaConsulta.paciente.id)
        return false;
      const extInicio = new Date(c.dataInicio).getTime();
      const extFim = new Date(c.dataFim).getTime();
      return novoInicio < extFim && novoFim > extInicio;
    });

    if (conflitoPaciente) {
      this.mostrarErro(
        'Conflito de Agenda',
        'Este paciente já possui outro atendimento marcado na clínica durante este mesmo horário.'
      );
      return;
    }

    
    this.http.post('http://localhost:8082/consultas', this.novaConsulta).subscribe({
      next: (response: any) => { 
        const provisao = {
          descricao: this.novaConsulta.descricao,
          valor: this.valorSugeridoAtual,
          tipo: 'ENTRADA', 
          status: 'PENDENTE', 
          dataLancamento: this.novaConsulta.dataInicio,
          paciente: { id: this.novaConsulta.paciente.id },
          consultaId: response.id 
        };
        
        this.http.post('http://localhost:8082/financeiro', provisao).subscribe({
          next: () => {
            this.exibirModalConsulta = false;
            this.carregarDados();
            this.mostrarSucesso('Consulta agendada com sucesso!');
          },
          error: (err) => {
            console.error('Erro ao criar lançamento financeiro:', err);
            this.mostrarErro('Erro Financeiro', 'Não foi possível criar o lançamento financeiro para a consulta.');
            
          },
        });
      },
      error: (err) => {
        let mensagemAmigavel = err.error;
        if (!mensagemAmigavel || typeof mensagemAmigavel !== 'string') {
          mensagemAmigavel =
            'O último horário que pode ser marcado é 17:30 por conta do horário de atendimento da clínica (encerramento às 18:00).';
        }
        this.mostrarErro('Restrição de Horário', mensagemAmigavel);
      },
    });
  }

  finalizarConsulta(c: any) {
    this.mostrarConfirmacao(
      'Finalizar Consulta',
      `Confirmar finalização do procedimento de ${c.paciente?.nome}?`,
      () => {
        this.modalConfirmacao.visivel = false;

        this.http.put(`http://localhost:8082/consultas/${c.id}/finalizar`, {}).subscribe({
          next: () => {
            // Após finalizar a consulta, atualiza lançamento financeiro
            // Chama o endpoint no backend para atualizar o status do lançamento
            this.http.put(`http://localhost:8082/financeiro/atualizar-status-por-consulta/${c.id}`, { status: 'PAGO' }).subscribe({
              next: () => {
                this.mostrarSucesso('Consulta finalizada com sucesso!');
                this.carregarDados(); 
                this.calcularSaldoReal(); 

                if (this.userRole === 'DENTISTA') {
                  setTimeout(() => {
                    this.trocarAba('receitas');
                    this.abrirModalNovaReceita(c.paciente?.id);
                  }, 1200);
                }
              },
              error: (err) => {
                console.error('Erro ao atualizar status financeiro:', err);
                this.mostrarErro('Erro Financeiro', 'Não foi possível atualizar o status do lançamento financeiro. O saldo pode estar inconsistente.');
                this.carregarDados(); 
                this.calcularSaldoReal(); 
              }
            });
          },
          error: (err) => {
            console.error('Erro ao finalizar consulta:', err);
            this.mostrarErro('Erro Operacional', err.error || 'Não foi possível finalizar a consulta.');
          },
        });
      }
    );
  }

  confirmarCancelamento() {
    if (!this.modalCancelamento.motivo || !this.modalCancelamento.motivo.trim()) {
      this.modalCancelamento.erro =
        'O preenchimento do motivo é estritamente obrigatório!';
      return;
    }

    this.modalCancelamento.erro = '';
    const c = this.modalCancelamento.consulta;
    const motivoStr = this.modalCancelamento.motivo.trim();

    this.http
      .put(`http://localhost:8082/consultas/${c.id}/cancelar`, motivoStr)
      .subscribe({
        next: () => {
          this.modalCancelamento.visivel = false;
          c.status = 'CANCELADA';
          c.motivoCancelamento = motivoStr;

          
          this.http.put(`http://localhost:8082/financeiro/atualizar-status-por-consulta/${c.id}`, { status: 'CANCELADO' }).subscribe({
            next: () => {
              this.mostrarSucesso('Agendamento cancelado. A vaga foi liberada para outros pacientes!');
              this.carregarDados();
              this.calcularSaldoReal(); // Garante que o saldo seja recalculado.
            },
            error: (err) => {
              console.error('Erro ao atualizar status financeiro no cancelamento:', err);
              this.mostrarErro('Erro Financeiro', 'Não foi possível atualizar o status do lançamento financeiro ao cancelar a consulta.');
              this.carregarDados();
              this.calcularSaldoReal(); // Tenta recalcular mesmo com erro.
            }
          });
        },
        error: () => {
          this.modalCancelamento.erro =
            'Houve um erro no servidor ao tentar processar o cancelamento.';
        },
      });
  }

  excluirEspecialidade(id: number) {
    this.mostrarConfirmacao(
      'Remover Especialidade',
      'Tem certeza que deseja apagar permanentemente esta especialidade?',
      () => {
        this.modalConfirmacao.visivel = false;
        this.http.delete(`http://localhost:8082/especialidades/${id}`).subscribe({
          next: () => {
            this.carregarDados();
            this.mostrarSucesso('Especialidade removida!');
          },
          error: () =>
            this.mostrarErro(
              'Ação Negada',
              'Esta especialidade possui profissionais vinculados e não pode ser apagada.'
            ),
        });
      }
    );
  }

  salvarDentista() {
    if (
      !this.novoDentista.nome ||
      !this.novoDentista.cro ||
      !this.novoDentista.cpf ||
      !this.novoDentista.email ||
      !this.novoDentista.especialidades
    ) {
      this.mostrarErro(
        'Campos Incompletos',
        'Por favor, preencha todos os campos do cadastro do dentista.'
      );
      return;
    }

    if (!this.validarFormatoEmail(this.novoDentista.email)) {
      this.mostrarErro(
        'Formato Inválido',
        'Por favor, informe um endereço de e-mail clinicamente válido.'
      );
      return;
    }

    const nomeTratado = this.novoDentista.nome.trim().toLowerCase();
    const dentistaNomeDuplicado = this.dentistas.some(
      (d) =>
        d.nome.trim().toLowerCase() === nomeTratado &&
        d.id !== this.novoDentista.id
    );

    if (dentistaNomeDuplicado) {
      this.mostrarErro(
        'Profissional Duplicado',
        'Já existe um dentista registrado com este mesmo nome na clínica.'
      );
      return;
    }

    const dentistaDadosDuplicados = this.dentistas.some(
      (d) =>
        (d.cpf === this.novoDentista.cpf ||
          d.cro === this.novoDentista.cro) &&
        d.id !== this.novoDentista.id
    );

    if (dentistaDadosDuplicados) {
      this.mostrarErro(
        'Cadastro Duplicado',
        'Já existe um profissional cadastrado com este CPF ou CRO na clínica.'
      );
      return;
    }

    const payload = {
      ...this.novoDentista,
      especialidades: [{ id: Number(this.novoDentista.especialidades) }],
    };
    const req = this.editando
      ? this.http.put(
          `http://localhost:8082/dentistas/${this.novoDentista.id}`,
          payload
        )
      : this.http.post('http://localhost:8082/dentistas', payload);

    req.subscribe({
      next: () => {
        this.exibirModalDentista = false;
        this.carregarDados();
        this.mostrarSucesso('Dentista salvo com sucesso!');
      },
      error: () => {
        this.mostrarErro(
          'Erro de Cadastro',
          'Não foi possível salvar os dados. Verifique a conexão com o banco.'
        );
      },
    });
  }

  salvarPaciente() {
    if (
      !this.novoPaciente.nome ||
      !this.novoPaciente.cpf ||
      !this.novoPaciente.telefone ||
      !this.novoPaciente.email
    ) {
      this.mostrarErro(
        'Campos Incompletos',
        'Por favor, preencha todos os campos do cadastro do paciente.'
      );
      return;
    }

    if (!this.validarFormatoEmail(this.novoPaciente.email)) {
      this.mostrarErro(
        'Formato Inválido',
        'Por favor, informe um endereço de e-mail clinicamente válido.'
      );
      return;
    }

    const nomeTratado = this.novoPaciente.nome.trim().toLowerCase();
    const pacienteNomeDuplicado = this.pacientes.some(
      (p) =>
        p.nome.trim().toLowerCase() === nomeTratado &&
        p.id !== this.novoPaciente.id
    );

    if (pacienteNomeDuplicado) {
      this.mostrarErro(
        'Paciente Duplicado',
        'Já existe um paciente cadastrado com este mesmo nome no sistema.'
      );
      return;
    }

    const cpfDuplicado = this.pacientes.some(
      (p) =>
        p.cpf === this.novoPaciente.cpf && p.id !== this.novoPaciente.id
    );

    if (cpfDuplicado) {
      this.mostrarErro(
        'Cadastro Duplicado',
        'Já existe um paciente cadastrado com este exato CPF no sistema.'
      );
      return;
    }

    const req = this.editando
      ? this.http.put(
          `http://localhost:8082/pacientes/${this.novoPaciente.id}`,
          this.novoPaciente
        )
      : this.http.post('http://localhost:8082/pacientes', this.novoPaciente);

    req.subscribe({
      next: () => {
        this.exibirModalPaciente = false;
        this.carregarDados();
        this.mostrarSucesso('Paciente salvo com sucesso!');
      },
      error: () => {
        this.mostrarErro(
          'Erro de Cadastro',
          'Ocorreu um erro no servidor ao salvar o paciente.'
        );
      },
    });
  }

  // ===== USUÁRIOS =====

  salvarUsuario() {
    if (!this.novoUsuario.nome || !this.novoUsuario.email || !this.novoUsuario.perfil) {
      this.mostrarErro(
        'Campos Incompletos',
        'Preencha nome, e-mail e perfil do usuário antes de salvar.'
      );
      return;
    }

    if (!this.validarFormatoEmail(this.novoUsuario.email)) {
      this.mostrarErro(
        'Formato Inválido',
        'Informe um endereço de e-mail válido para o usuário.'
      );
      return;
    }

    if (!this.editando && (!this.novoUsuario.senha || !this.novoUsuario.senha.trim())) {
      this.mostrarErro(
        'Senha Obrigatória',
        'Defina uma senha inicial para o usuário.'
      );
      return;
    }

    const req = this.editando
      ? this.http.put(
          `http://localhost:8082/usuarios/${this.novoUsuario.id}`,
          this.novoUsuario
        )
      : this.http.post('http://localhost:8082/usuarios', this.novoUsuario);

    req.subscribe({
      next: () => {
        this.exibirModalUsuario = false;
        this.carregarDados();
        this.mostrarSucesso('Usuário salvo com sucesso!');
      },
      error: (err) => {
        const mensagem =
          typeof err?.error === 'string' && err.error.trim().length > 0
            ? err.error
            : 'Não foi possível salvar o usuário. Verifique se o e-mail já não está em uso.';
        this.mostrarErro('Erro ao salvar usuário', mensagem);
      }
    });
  }

  salvarEspecialidade() {
    if (!this.novaEspecialidade.nome || !this.novaEspecialidade.nome.trim()) {
      this.mostrarErro(
        'Campos Incompletos',
        'Informe o nome da especialidade clínica.'
      );
      return;
    }

    const nomeTratado = this.novaEspecialidade.nome.trim().toLowerCase();
    const especialidadeDuplicada = this.especialidades.some(
      (e) => e.nome.trim().toLowerCase() === nomeTratado
    );

    if (especialidadeDuplicada) {
      this.mostrarErro(
        'Especialidade Duplicada',
        'Esta especialidade já encontra-se cadastrada na clínica.'
      );
      return;
    }

    this.http
      .post('http://localhost:8082/especialidades', this.novaEspecialidade)
      .subscribe(() => {
        this.exibirModalEspecialidade = false;
        this.carregarDados();
        this.mostrarSucesso('Especialidade criada!');
      });
  }

  salvarEvolucaoMapeada() {}

  salvarLancamento() {
    const { descricao, valor, tipo, paciente } = this.novoLancamento;

    if (!descricao || !descricao.trim() || valor == null || valor <= 0 || !tipo || tipo.trim() === '') {
      this.mostrarErro(
        'Campos Incompletos',
        'Preencha descrição, valor e tipo do lançamento antes de salvar.'
      );
      return;
    }

    const payload = paciente.id
      ? { ...this.novoLancamento, status: 'PAGO' } // Lançamentos manuais são considerados pagos imediatamente
      : { ...this.novoLancamento, paciente: null, status: 'PAGO' }; // Lançamentos avulsos também são pagos

    this.http.post('http://localhost:8082/financeiro', payload).subscribe(() => {
      this.exibirModalFinanceiro = false;
      this.carregarDados();
      this.mostrarSucesso('Registro efetuado!');
    });
  }

  baixarRelatorioFinanceiro() {
    this.http
      .get('http://localhost:8082/relatorios/financeiro', { responseType: 'blob' })
      .subscribe((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Financeiro_Risum.pdf';
        a.click();
      });
  }

  // ===== ABA / LOGIN =====

  trocarAba(aba: string) {
    this.abaAtiva = aba;
    if (aba === 'inicio') setTimeout(() => this.inicializarGraficos(), 300);
  }

  deslogar() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  // ===== AUXILIARES PARA TEMPLATE =====

  abrirMascaraCPF(event: any, contexto: 'paciente' | 'dentista') {
    this.aplicarMascaraCPF(event, contexto);
  }
  abrirMascaraTelefone(event: any) {
    this.aplicarMascaraTelefone(event);
  }
  abrirMascaraCRO(event: any) {
    this.aplicarMascaraCRO(event);
  }

  abrirModalPaciente() {
    this.editando = false;
    this.novoPaciente = {
      id: null,
      nome: '',
      email: '',
      cpf: '',
      telefone: '',
      ativo: true,
      justificativaStatus: null
    };
    this.exibirModalPaciente = true;
  }

  abrirEdicaoPaciente(p: any) {
    this.editando = true;
    this.novoPaciente = { ...p };
    this.exibirModalPaciente = true;
  }

  abrirModalDentista() {
    this.editando = false;
    this.novoDentista = {
      id: null,
      nome: '',
      cro: '',
      cpf: '',
      email: '',
      especialidades: '',
      ativo: true,
      justificativaStatus: null
    };
    this.exibirModalDentista = true;
  }

  abrirEdicaoDentista(d: any) {
    this.editando = true;
    this.novoDentista = { ...d, especialidades: d.especialidades[0]?.id };
    this.exibirModalDentista = true;
  }

  abrirModalUsuario() {
    this.editando = false;
    this.novoUsuario = { id: null, nome: '', email: '', perfil: 'DENTISTA', senha: '' };
    this.exibirModalUsuario = true;
  }

  abrirEdicaoUsuario(u: any) {
    this.editando = true;
    this.novoUsuario = { ...u, senha: '' };
    this.exibirModalUsuario = true;
  }

  abrirModalConsulta() {
    this.novaConsulta = {
      paciente: { id: null },
      dentista: { id: null },
      procedimentosSelecionados: [],
      descricao: '',
      dataInicio: '',
      dataFim: '',
    };
    this.servicosFiltrados = [];
    this.valorSugeridoAtual = 0;
    this.buscarPacientes();
    this.buscarDentistas();
    this.exibirModalConsulta = true;
  }

  abrirModalEspecialidade() {
    this.novaEspecialidade = { id: null, nome: '' };
    this.exibirModalEspecialidade = true;
  }

  boxModalFinanceiro() {
    this.abrirModalFinanceiro();
  }

  abrirModalFinanceiro() {
    this.novoLancamento = {
      id: null,
      descricao: '',
      valor: null,
      tipo: 'ENTRADA',
      paciente: { id: null },
      consultaId: null,
      status: 'PAGO' 
    };
    this.exibirModalFinanceiro = true;
  }
}