# Risum Odonto - Frontend (Sistema de Gestão de Consultas)

Bem-vindo ao repositório do frontend do sistema de gestão de clínicas odontológicas Risum Odonto. Este projeto é a interface do usuário que permite aos usuários interagir com o backend para gerenciar consultas, pacientes, prontuários e outras funcionalidades da clínica.

## 🚀 Tecnologias Utilizadas

Este frontend foi construído com as seguintes tecnologias e ferramentas:

*   **Framework:** React (ou Angular, Vue.js - *ajuste conforme o seu*)
*   **Linguagem:** JavaScript / TypeScript (ou apenas JavaScript - *ajuste conforme o seu*)
*   **Gerenciamento de Estado:** Redux (ou Context API, Zustand, etc. - *ajuste conforme o seu*)
*   **Estilização:** Styled Components (ou Sass, Tailwind CSS, CSS Modules - *ajuste conforme o seu*)
*   **Roteamento:** React Router DOM (ou similar)
*   **Requisições HTTP:** Axios (ou Fetch API)
*   **Build Tool:** Vite (ou Create React App, Webpack - *ajuste conforme o seu*)
*   **Testes:** Jest, React Testing Library (ou Cypress, Playwright - *ajuste conforme o seu*)

## 📦 Estrutura do Projeto

O projeto segue uma estrutura modular para facilitar a organização e manutenção:

## ⚙️ Configuração e Execução

Siga os passos abaixo para configurar e executar o projeto em seu ambiente local.

### Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas:

*   Node.js (versão LTS recomendada)
*   npm (Node Package Manager) ou Yarn
*   Um cliente Git

### 1. Clonar o Repositório
git clone git@github.com:btechsolution/sistema-gestao-consultas-front.git
cd sistema-gestao-consultas-front

*   **Ajuste o nome do repositório conforme o seu.**

### 2. Instalar Dependências

npm install
# ou
yarn install

### 3. Configurar Variáveis de Ambiente

O frontend precisa saber onde o backend está rodando. As configurações de ambiente são definidas em `src/environments/`.

1.  Abra `src/environments/environment.ts` (para desenvolvimento) e `src/environments/environment.prod.ts` (para produção).
2.  Ajuste a URL da API para onde seu backend está sendo executado:

    ```typescript
    export const environment = {
      production: false,
      apiUrl: 'http://localhost:8080/api' // Ajuste conforme a URL do seu backend
    };
    ```
    *   **Importante:** Para produção, utilize a URL do backend em produção.

### 4. Executar a Aplicação

Para iniciar o servidor de desenvolvimento:
ng serve

A aplicação será iniciada e estará disponível em `http://localhost:4200` (ou a porta configurada, que geralmente é exibida no terminal).

Para construir a aplicação para produção:


ng build --configuration production


### 5. Executar Testes

Para executar os testes unitários:


ng test

Para executar os testes end-to-end (E2E):
ng e2e

## 🤝 Contribuição

Contribuições são bem-vindas! Se você deseja contribuir, por favor, siga os seguintes passos:

1.  Faça um fork do projeto.
2.  Crie uma nova branch (`git checkout -b feature/minha-nova-feature`).
3.  Faça suas alterações e commit (`git commit -m 'feat: Adiciona nova funcionalidade X'`).
4.  Envie para a branch (`git push origin feature/minha-nova-feature`).
5.  Abra um Pull Request.

## 📝 Licença

Este projeto está licenciado sob a Licença MIT (ou a licença que você preferir). Veja o arquivo `LICENSE` para mais detalhes.

---

