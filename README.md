# 🚀 Projeto de Encurtamento de URL

## 📌 Visão Geral
Este projeto tem como objetivo criar uma API para encurtamento de URLs seguindo boas práticas de desenvolvimento.

## 🌍 Pré-requisitos

Antes de começar, verifique se você tem as seguintes ferramentas instaladas:

### 🔹 **Node.js** (Versão 22.13.1)
O Node.js é necessário para rodar o servidor da API. Verifique a versão instalada com o seguinte comando:
```sh
node -v
```

### 🔹 **npm** (Gerenciador de Pacotes do Node.js  - Versão 10.9.2) 
O npm é utilizado para gerenciar as dependências do projeto. Verifique a versão instalada com:
```sh
npm -v
```

### 🔹 **Docker**
Docker é necessário para a criação e execução dos containers do projeto. Verifique a versão instalada com:
```sh
docker -v
```

### 🔹 **Docker**
O Docker Compose é utilizado para orquestrar múltiplos containers. Verifique a versão instalada com:
```sh
docker-compose -v
```

## 🌍 Configuração Inicial

### 🛠 **Passos para Inicializar o Projeto**

1. **Clone o Repositório**:
   ```sh
   git clone https://github.com/Matheus-SS/encurtador-url.git
   cd encurtador-url
   ```
2. **Instale as dependências**
   ```sh
   npm ci
   ```
3. **Variáveis de Ambiente**
Crie um arquivo `.env.development` na raiz do projeto e cole os dados do arquivo `.env.example` nele.

4. **Compile o Projeto**
   ```sh
   npm run build
   ```
5. **Execute o docker compose para subir o banco de dados**
   ```sh
   docker-compose -f docker-compose.local.yml up -d
   ```
5. **Execute as migrations  do banco de dados**
   ```sh
   npm run migration:run
   ```
7. **Inicie o servidor**
   ```sh
   npm run start:dev
   ```

8. **Testes**
   ```sh
   npm run test
   ```

9. **Acesse os ambiente de  desenvolvimento:**
   - API: `http://localhost:3000`
   - API Docs: `http://localhost:3000/docs`

## 📊 Monitoramento com Prometheus e Grafana
O projeto conta com monitoramento via Prometheus e Grafana. Eles não executados junto com o docker-compose.local.yml. Fica a seu critério se quer utilizá-lo.

### 🐳 **Executando com Docker Compose de monitoramento**

1. Suba os containers de monitoramento com o Docker Compose:
   Na raiz do projeto execute:
```sh
docker-compose -f ./monitoring/docker-compose.local.monitoring.yml up
```
2. Acesse a aplicação:
   - Prometheus: `http://localhost:9090`
   - Grafana: `http://localhost:3010`
     - Usuário: `admin`
     - Senha: `admin`

## 🏗 Estrutura do Banco de Dados
A API utiliza um banco de dados relacional postegreSQL com a seguinte estrutura de tabelas:

### **Tabela `users`**
| Campo       | Tipo    | Descrição |
|------------|--------|------------|
| `id`        | int | Identificador único do usuário |
| `email`     | varchar | E-mail do usuário |
| `password`  | varchar | Senha criptografada do usuário |
| `created_at` | timestampz   | Data de criação |
| `updated_at` | timestampz   | Data da última atualização |

### **Tabela `short_urls`**
| Campo         | Tipo    | Descrição |
|--------------|--------|------------|
| `id`          | int | Identificador único da URL encurtada |
| `original_url` | text | URL original |
| `short_code`  | varchar | Código encurtado da URL |
| `user_id`     | int | Referência ao usuário dono da URL (pode ser nulo) |
| `click_count` | int | Quantidade de acessos |
| `created_at`  | timestampz   | Data de criação |
| `updated_at`  | timestampz   | Data da última atualização |
| `deleted_at`  | timestampz   | Data da remoção (soft delete) |

## 🌍 Endpoints da API

### 🔑 **Autenticação**
- `POST /api/v1/auth/signin` - Login com e-mail e senha, retorna um Bearer Token.
- `POST /api/v1/auth/signup` - Cadastro de novos usuários.

### 🔗 **Gerenciamento de URLs**
- `POST /api/v1/short-url` - Encurtar uma URL (autenticado ou não).
- `GET /api/v1/short-url/r/:short_code` - Redireciona para a URL original e contabiliza um clique.

### 🔐 **Endpoints protegidos** (Apenas para usuários autenticados)
- `GET /api/v1/short-url/my-urls` - Lista todas as URLs encurtadas do usuário com total de cliques.
- `DELETE /api/v1/short-url/:short_code` - Deleta uma URL encurtada.
- `PATCH /api/v1/short-url/:short_code` - Atualiza a URL original.

## 🔧 **Configuração e Execução do Projeto**

Nos passos seguir você executará todo o projeto usando a api em forma de container docker.

### 🐳 **Executando com Docker Compose**

1. **Clone o repositório caso já não tenha feito:**
   ```sh
   git clone https://github.com/Matheus-SS/encurtador-url.git
   cd encurtador-url
   ```

2. **Suba os containers com Docker Compose:**
   ```sh
   docker-compose up --build
   ```

3. **Execute as migrations do banco de dados:**
    ```sh
    docker exec -it shortener-url-api npm run docker-migration:run
    ```

4. **Acesse a aplicação:**
   - API: `http://localhost:3000`
   - API Docs: `http://localhost:3000/docs`

## 📊 Monitoramento com Prometheus e Grafana
O projeto conta com monitoramento via Prometheus e Grafana. Eles não executados junto com o projeto inicial docker. Fica a seu critério se quer utilizá-lo.

### 🐳 **Executando com Docker Compose de Monitoramento**

1. Suba os containers de monitoramento com o Docker Compose:
   Na raiz do projeto execute:
   ```sh
   docker-compose -f ./monitoring/docker-compose.monitoring.yml up
   ```
2. Acesse a aplicação:
   - Prometheus: `http://localhost:9090`
   - Grafana: `http://localhost:3010`
     - Usuário: `admin`
     - Senha: `admin`

### 📈 Métricas Monitoradas
A API inclui métricas personalizadas coletadas por Prometheus:

- **`app_duration_metrics`**: Mede a duração das requisições, com rótulos `app_method` (método HTTP), `app_origin` (rota) e `le` (tempo em milisegundos).
- **`app_error_metrics`**: Contabiliza as requisições com base no método HTTP, rota e status da resposta.
- **`app_http_signup_metrics`**: Conta requisições para o endpoint de registro (`/api/v1/auth/signup`), categorizadas por origem e status.

<div style="text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 10px;">
    Este gráfico mostra um teste de carga de requisições para o endpoint de criação de usuário, utilizando o K6 para realizar o load testing.
</div>

![Grafana gráfico quantidade signup](https://res.cloudinary.com/dmc3joteb/image/upload/v1738471776/grafana_pi1ioj.png)



