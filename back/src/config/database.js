const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'myeconomy',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'root',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3000,
    dialect: 'mysql',
    logging: false, // Desativa logs SQL no console
    define: {
      timestamps: true, // Adiciona createdAt e updatedAt
      underscored: true, // Usa snake_case ao invés de camelCase
      underscoredAll: true
    }
  }
);

// Função para testar a conexão
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
  } catch (error) {
    console.error('Erro ao conectar com o banco de dados:', error);
  }
};

module.exports = {
  sequelize,
  testConnection
}; 