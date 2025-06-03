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