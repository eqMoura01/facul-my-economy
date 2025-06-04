require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, testConnection } = require('./config/database');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Testar conexão com o banco de dados
testConnection();

// Sincronizar modelos com o banco de dados
sequelize.sync({ alter: true })
  .then(() => console.log('Modelos sincronizados com o banco de dados'))
  .catch((err) => console.error('Erro ao sincronizar modelos:', err));

// Rotas
app.use('/api/usuarios', require('./routes/userRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));

// Middleware de erro
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'erro',
    mensagem: 'Algo deu errado!',
    erro: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({
    status: 'erro',
    mensagem: 'Rota não encontrada'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 