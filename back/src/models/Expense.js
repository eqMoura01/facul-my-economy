const { Model, DataTypes } = require('sequelize');
const { sequelize, Sequelize } = require('../config/database');

class Expense extends Model {}

Expense.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'email'
    }
  },
  descricao: {
    type: DataTypes.STRING,
    allowNull: false
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  data: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Expense',
  tableName: 'expenses',
  timestamps: true,
  indexes: [
    {
      fields: ['email', 'data']
    }
  ]
});

module.exports = Expense; 