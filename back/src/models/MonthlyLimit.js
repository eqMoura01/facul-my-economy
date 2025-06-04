const { Model, DataTypes } = require('sequelize');
const { sequelize, Sequelize } = require('../config/database');

class MonthlyLimit extends Model {}

MonthlyLimit.init({
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
  mes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 12
    }
  },
  ano: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  limite: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.ENUM('abaixo_limite', 'acima_limite', 'sem_limite'),
    allowNull: false,
    defaultValue: 'sem_limite'
  }
}, {
  sequelize,
  modelName: 'MonthlyLimit',
  tableName: 'monthly_limits',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['email', 'mes', 'ano']
    }
  ]
});

module.exports = MonthlyLimit; 