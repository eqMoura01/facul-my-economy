# Backend do Aplicativo de Finanças

## Configuração do Ambiente

### Pré-requisitos
- Docker
- Docker Compose
- Node.js
- npm

### Configuração do Banco de Dados

1. Crie um arquivo `.env` na pasta `back` com as seguintes variáveis:
```env
PORT=3000
DB_HOST=localhost
DB_USER=finance_user
DB_PASSWORD=finance_pass
DB_NAME=finance_app
JWT_SECRET=sua_chave_secreta_muito_segura
JWT_EXPIRES_IN=7d
```

2. Inicie o container do MySQL:
```bash
docker-compose up -d
```

3. Para verificar se o container está rodando:
```bash
docker ps
```

4. Para ver os logs do container:
```bash
docker logs finance_app_mysql
```

5. Para parar o container:
```bash
docker-compose down
```

### Instalação e Execução

1. Instale as dependências:
```bash
npm install
```

2. Inicie o servidor em modo desenvolvimento:
```bash
npm run dev
```

## Estrutura do Banco de Dados

O MySQL será executado com as seguintes configurações:
- Host: localhost
- Porta: 3306
- Usuário: finance_user
- Senha: finance_pass
- Banco de dados: finance_app

## Comandos Úteis do Docker

- Iniciar containers: `docker-compose up -d`
- Parar containers: `docker-compose down`
- Ver logs: `docker logs finance_app_mysql`
- Acessar o MySQL via CLI: `docker exec -it finance_app_mysql mysql -u finance_user -p`
- Remover volumes: `docker-compose down -v`

## Backup e Restauração

### Backup
```bash
docker exec finance_app_mysql mysqldump -u finance_user -pfinance_pass finance_app > backup.sql
```

### Restauração
```bash
docker exec -i finance_app_mysql mysql -u finance_user -pfinance_pass finance_app < backup.sql
```

# API de Controle de Gastos

API para controle de gastos pessoais com limite mensal e categorização de despesas.

## Autenticação

Todas as rotas (exceto login e registro) requerem autenticação via token JWT no header:
```
Authorization: Bearer seu_token_jwt
```

## Rotas de Usuários

### 1. Registrar Usuário
Cria uma nova conta de usuário.

**Endpoint:** `POST /api/usuarios/registro`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "nome": "João Silva",
  "email": "joao@exemplo.com",
  "senha": "senha123",
  "confirmarSenha": "senha123"
}
```

**Exemplo de uso:**
```bash
curl -X POST http://localhost:3000/api/usuarios/registro \
-H "Content-Type: application/json" \
-d '{"nome": "João Silva", "email": "joao@exemplo.com", "senha": "senha123", "confirmarSenha": "senha123"}'
```

**Resposta de sucesso:**
```json
{
  "status": "sucesso",
  "token": "seu_token_jwt",
  "usuario": {
    "nome": "João Silva",
    "email": "joao@exemplo.com"
  }
}
```

### 2. Login
Autentica um usuário existente.

**Endpoint:** `POST /api/usuarios/login`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "joao@exemplo.com",
  "senha": "senha123"
}
```

**Exemplo de uso:**
```bash
curl -X POST http://localhost:3000/api/usuarios/login \
-H "Content-Type: application/json" \
-d '{"email": "joao@exemplo.com", "senha": "senha123"}'
```

**Resposta de sucesso:**
```json
{
  "status": "sucesso",
  "token": "seu_token_jwt",
  "usuario": {
    "nome": "João Silva",
    "email": "joao@exemplo.com"
  }
}
```

### 3. Obter Perfil
Retorna os dados do usuário logado.

**Endpoint:** `GET /api/usuarios/perfil`

**Headers:**
```
Authorization: Bearer seu_token_jwt
```

**Exemplo de uso:**
```bash
curl -X GET http://localhost:3000/api/usuarios/perfil \
-H "Authorization: Bearer seu_token_jwt"
```

**Resposta de sucesso:**
```json
{
  "nome": "João Silva",
  "email": "joao@exemplo.com",
  "createdAt": "2024-01-20T10:00:00.000Z",
  "updatedAt": "2024-01-20T10:00:00.000Z"
}
```

### 4. Atualizar Perfil
Atualiza os dados do usuário logado.

**Endpoint:** `PUT /api/usuarios/perfil`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer seu_token_jwt
```

**Body:**
```json
{
  "nome": "João Silva Atualizado",
  "senhaAtual": "senha123",
  "novaSenha": "novaSenha123",
  "confirmarNovaSenha": "novaSenha123"
}
```

**Exemplo de uso:**
```bash
curl -X PUT http://localhost:3000/api/usuarios/perfil \
-H "Content-Type: application/json" \
-H "Authorization: Bearer seu_token_jwt" \
-d '{"nome": "João Silva Atualizado", "senhaAtual": "senha123", "novaSenha": "novaSenha123", "confirmarNovaSenha": "novaSenha123"}'
```

**Resposta de sucesso:**
```json
{
  "status": "sucesso",
  "mensagem": "Perfil atualizado com sucesso",
  "usuario": {
    "nome": "João Silva Atualizado",
    "email": "joao@exemplo.com",
    "updatedAt": "2024-01-20T10:00:00.000Z"
  }
}
```

## Rotas de Despesas

### 1. Definir Limite Mensal
Define o limite de gastos para um mês específico.

**Endpoint:** `POST /api/expenses/limite`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer seu_token_jwt
```

**Body:**
```json
{
  "mes": 1,        // Número do mês (1-12)
  "ano": 2024,     // Ano
  "valor": 2000.00 // Valor do limite em reais
}
```

**Exemplo de uso:**
```bash
curl -X POST http://localhost:3000/api/expenses/limite \
-H "Content-Type: application/json" \
-H "Authorization: Bearer seu_token_jwt" \
-d '{"mes": 1, "ano": 2024, "valor": 2000.00}'
```

**Resposta de sucesso:**
```json
{
  "id": 1,
  "email": "usuario@exemplo.com",
  "mes": 1,
  "ano": 2024,
  "limite": "2000.00",
  "status": "sem_limite",
  "createdAt": "2024-01-20T10:00:00.000Z",
  "updatedAt": "2024-01-20T10:00:00.000Z"
}
```

### 2. Adicionar Despesa
Registra uma nova despesa no sistema.

**Endpoint:** `POST /api/expenses/despesa`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer seu_token_jwt
```

**Body:**
```json
{
  "descricao": "Compras do mês",  // Descrição da despesa
  "valor": 1500.00,               // Valor em reais
  "data": "2024-01-15",          // Data no formato YYYY-MM-DD
  "categoria": "Alimentação"      // Categoria da despesa
}
```

**Exemplo de uso:**
```bash
curl -X POST http://localhost:3000/api/expenses/despesa \
-H "Content-Type: application/json" \
-H "Authorization: Bearer seu_token_jwt" \
-d '{"descricao": "Compras do mês", "valor": 1500.00, "data": "2024-01-15", "categoria": "Alimentação"}'
```

**Resposta de sucesso:**
```json
{
  "id": 1,
  "email": "usuario@exemplo.com",
  "descricao": "Compras do mês",
  "valor": "1500.00",
  "data": "2024-01-15",
  "categoria": "Alimentação",
  "createdAt": "2024-01-20T10:00:00.000Z",
  "updatedAt": "2024-01-20T10:00:00.000Z"
}
```

### 3. Obter Resumo Mensal
Retorna um resumo completo do mês, incluindo limite, total de despesas e lista de despesas.

**Endpoint:** `GET /api/expenses/resumo/:mes/:ano`

**Headers:**
```
Authorization: Bearer seu_token_jwt
```

**Parâmetros de URL:**
- `mes`: Número do mês (1-12)
- `ano`: Ano

**Exemplo de uso:**
```bash
curl -X GET http://localhost:3000/api/expenses/resumo/1/2024 \
-H "Authorization: Bearer seu_token_jwt"
```

**Resposta de sucesso:**
```json
{
  "limite": "2000.00",
  "totalDespesas": 1500.00,
  "status": "abaixo_limite",
  "despesas": [
    {
      "id": 1,
      "descricao": "Compras do mês",
      "valor": "1500.00",
      "data": "2024-01-15",
      "categoria": "Alimentação",
      "createdAt": "2024-01-20T10:00:00.000Z",
      "updatedAt": "2024-01-20T10:00:00.000Z"
    }
  ]
}
```

## Status do Limite

O campo `status` pode ter os seguintes valores:
- `abaixo_limite`: Total de despesas é menor ou igual ao limite
- `acima_limite`: Total de despesas é maior que o limite
- `sem_limite`: Não há limite definido para o mês

## Códigos de Erro

- `400`: Erro na validação dos dados
- `401`: Não autenticado ou token inválido
- `404`: Rota não encontrada
- `500`: Erro interno do servidor

## Exemplos de Erro

```json
{
  "status": "erro",
  "mensagem": "Descrição da despesa é obrigatória"
}
```

```json
{
  "status": "erro",
  "mensagem": "Você não está logado. Por favor, faça login para ter acesso."
}
``` 