🦷 Risum Odonto - Frontend
Bem-vindo ao repositório do frontend da Risum Odonto! Este projeto é uma Single Page Application (SPA) desenvolvida com Angular, projetada para gerenciar as operações diárias de uma clínica odontológica de forma eficiente e intuitiva  
What is a Single-Page Application (SPA)? #HipstersPontoTube + 2
.

✨ Funcionalidades Principais
Nosso sistema foi pensado para otimizar cada etapa do fluxo de trabalho de uma clínica:

Autenticação e Autorização: Sistema de login robusto com JWT e controle de acesso baseado em perfis (ADMIN, RECEPCAO, DENTISTA).
Gestão de Pacientes: Cadastro, consulta, edição e visualização de prontuários completos de pacientes.
Agenda de Consultas: Agendamento flexível, visualização por calendário, e gerenciamento de status (finalização e cancelamento).
Gestão de Dentistas: Cadastro e gerenciamento de profissionais, incluindo especialidades e status de férias.
Gestão de Especialidades: Cadastro e consulta de especialidades odontológicas oferecidas.
Prescrição de Receitas: Emissão de receitas odontológicas para pacientes (funcionalidade exclusiva para o perfil DENTISTA).
Controle Financeiro: Registro detalhado de entradas e saídas, com visualização de resumos financeiros (perfil ADMIN).
Relatórios: Geração de declarações de comparecimento e relatórios financeiros em PDF.
Catálogo de Serviços: Consulta de procedimentos e seus respectivos valores.
🛠️ Tecnologias Utilizadas
Para construir uma aplicação moderna e eficiente, utilizamos as seguintes tecnologias:

Framework: Angular (v17+)
Linguagem: TypeScript
Estilização: SCSS
Gráficos: Chart.js
HTTP Client: Angular HttpClient
Roteamento: Angular Router
🚀 Como Rodar o Projeto

Siga estas instruções para configurar e executar o projeto em seu ambiente de desenvolvimento local. É mais fácil do que parece! 😉

Pré-requisitos:
Certifique-se de ter as seguintes ferramentas instaladas em sua máquina:

Node.js (versão 18.x ou superior): Inclui o npm.
Download Node.js
Angular CLI: Para instalar globalmente, use o comando: bash
npm install -g @angular/cli
Backend da Risum Odonto: Este frontend depende de um backend rodando na porta 8082. Certifique-se de que o backend esteja configurado e em execução antes de iniciar o frontend.
Documentação do Backend (para instruções de como rodar)
Passos para Configuração e Execução:
Clone o Repositório: bash
git clone <URL_DO_SEU_REPOSITORIO_FRONTEND>
cd risum-odonto-frontend # Ou o nome do seu diretório
Instale as Dependências: bash
npm install
Inicie o Servidor de Desenvolvimento: bash
ng serve
O aplicativo será executado em http://localhost:4200/. O navegador deve abrir automaticamente.
Acesse a Aplicação: Abra seu navegador e navegue para http://localhost:4200/.
📂 Estrutura do Projeto
O projeto segue a estrutura padrão de um aplicativo Angular, facilitando a navegação e o entendimento:

src/app/: Contém os componentes principais da aplicação.
dashboard/: Componente principal que gerencia as diferentes abas (Início, Agenda, Pacientes, etc.).
login/: Componente para a tela de autenticação.
app-routing.module.ts: Define as rotas da aplicação.
app.component.ts: Componente raiz.
src/assets/: Contém imagens, ícones e outros recursos estáticos.
src/styles.scss: Estilos globais da aplicação.

🤝 Contribuição
Contribuições são super bem-vindas! Se você tiver sugestões, melhorias ou encontrar bugs, por favor, siga estes passos:

Faça um fork do projeto.
Crie uma nova branch (ex: git checkout -b feature/minha-feature ou bugfix/correcao-bug).
Faça suas alterações e commit-as (ex: git commit -m 'feat: Adiciona nova funcionalidade').
Envie para a branch (ex: git push origin feature/minha-feature).
Abra um Pull Request.

📄 Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.