# 🚀 Projeto de Encurtamento de URL

## 📌 Visão Geral
Este projeto tem como objetivo criar uma API para encurtamento de URLs seguindo boas práticas de desenvolvimento.

## 🌍 Tecnologias Utilizadas
- **NestJS** para construção da API.
- **PostgreSQL** como banco de dados relacional.
- **Redis** para cache das URLs encurtadas.
- **Docker e Docker Compose** para conteinerização.
- **Kong API Gateway** para gerenciar as requisições e segurança.
- **Prometheus e Grafana** para monitoramento.
- **K6** para testes de carga.

## 🌍 Pré-requisitos
Antes de começar, verifique se você tem as seguintes ferramentas instaladas:

### 🔹 **Node.js** (Versão 22.13.1)
O Node.js é necessário para rodar o servidor da API. Verifique a versão instalada com:
```sh
node -v
```

### 🔹 **npm** (Gerenciador de Pacotes do Node.js  - Versão 10.9.2)
O npm é utilizado para gerenciar as dependências do projeto. Verifique a versão instalada com:
```sh
npm -v
```

### 🔹 **Docker e Docker Compose**
Docker é necessário para a criação e execução dos containers do projeto. Verifique a versão instalada com:
```sh
docker -v
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
3. **Configure as variáveis de ambiente**
Crie um arquivo `.env.development` na raiz do projeto e copie os dados do arquivo `.env.example` para ele.

4. **Compile o Projeto**
```sh
npm run build
```

5. **Execute o docker compose de desenvolvimento**
```sh
docker-compose up
```

6. **Execute as migrations do banco de dados**
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

9. **Acesse os ambientes de desenvolvimento:**
   - API: `http://localhost:8000`
   - API Docs: `http://localhost:8000/docs`

## 📊 Monitoramento com Prometheus e Grafana
O projeto conta com monitoramento via Prometheus e Grafana. Para acessá-los, utilize as seguintes URLs:
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3010`
   - Usuário: `admin`
   - Senha: `admin`

## 🏗 Estrutura do Banco de Dados
A API utiliza um banco de dados relacional PostgreSQL com a seguinte estrutura de tabelas:

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
- `POST /auth/signin` - Login com e-mail e senha, retorna um Bearer Token.
- `POST /auth/signup` - Cadastro de novos usuários.

### 🔗 **Gerenciamento de URLs**
- `POST /short-url` - Encurtar uma URL (autenticado ou não).
- `GET /short-url/r/:short_code` - Redireciona para a URL original e contabiliza um clique.

### 🔐 **Endpoints protegidos** (Apenas para usuários autenticados)
- `GET /short-url/my-urls` - Lista todas as URLs encurtadas do usuário com total de cliques.
- `DELETE /short-url/:short_code` - Deleta uma URL encurtada.
- `PATCH /short-url/:short_code` - Atualiza a URL original.
### 📊 **Monitoramento e Saúde**
- `GET /metrics` - Exposição de métricas para Prometheus.
- `GET /health` - Verificação de saúde da API.
- `GET /` - Endpoint raiz.

## 🔧 **Configuração e execução do projeto com Docker Compose**

Nos passos seguir você executará todo o projeto usando um ambiente dockerizado.

1. **Clone o repositório caso já não tenha feito:**
```sh
git clone https://github.com/Matheus-SS/encurtador-url.git
cd encurtador-url
```

2. **Suba os containers com Docker Compose:**
```sh
docker-compose -f docker-compose.prod.yml up -d
```

3. **Execute as migrations do banco de dados:**
```sh
docker exec -it shortener-url-api npm run docker-migration:run
```

4. **Acesse a aplicação:**
   - API: `http://localhost:8000`
   - API Docs: `http://localhost:8000/docs`

## 🚀 API Gateway com Kong
O Kong é utilizado para gerenciar as requisições e autenticação.
- URL do Kong: `http://localhost:8001`
- Rotas gerenciadas pelo Kong: `http://localhost:8001/routes`

### 📈 Monitoramento via Prometheus e Grafana
A API inclui métricas personalizadas coletadas por Prometheus:

- **`app_duration_metrics`**: Mede a duração das requisições, com rótulos `app_method` (método HTTP), `app_origin` (rota) e `le` (tempo em milisegundos).
- **`app_error_metrics`**: Contabiliza as requisições com base no método HTTP, rota e status da resposta.
- **`app_http_signup_metrics`**: Conta requisições para o endpoint de registro (`/auth/signup`), categorizadas por origem e status.

<div style="text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 10px;">
    Este gráfico mostra um teste de carga de requisições para o endpoint de criação de usuário, utilizando o K6 para realizar o load testing.
</div>

![Grafana gráfico quantidade signup](https://res.cloudinary.com/dmc3joteb/image/upload/v1738471776/grafana_pi1ioj.png)

## 📊 Cache com Redis
A rota `GET /short-url/r/:short_code` agora utiliza **Redis** para armazenar URLs encurtadas temporariamente, reduzindo a carga no banco de dados e melhorando a performance.

Agora, ao acessar uma URL encurtada, se ela estiver armazenada no cache, a API retorna sem precisar consultar o banco de dados! 🚀

## 🔥 **Sugestões de Melhorias**
- Implementar autenticação com dois fatores (2FA).
- Implementar um sistema de recuperação de senha com e-mails.
- Implementar um refresh token JWT e um tempo de expiração adequado.
- Implementar um suporte a OAuth com provedores como Google e GitHub.
- Implementar uma divisão em microserviços para escalabilidade e melhor desempenho.
- Implementar rate limit para evitar ataques de serviço.

### Sugestão de novos endpoints
#### 🔐 **Endpoints protegidos** (Apenas para usuários autenticados)
- `PATCH /user/profile` - Atualiza o perfil do usuário.
#### 🌍 **Autenticação com provedores externos (OAuth)**
- `POST /auth/oauth/google` - Login via Google.
- `POST /auth/oauth/github` - Login via GitHub.
#### 🔑 **Autenticação**
- `POST /auth/refresh` - Gera um novo token JWT com base no refresh token.
- `POST /auth/reset-password` - Solicita um reset de senha.
- `POST /auth/2fa/enable` - Ativa autenticação de dois fatores.
- `POST /auth/2fa/verify` - Verifica o código da autenticação de dois fatores.