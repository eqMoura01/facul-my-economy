const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    validate: {
      isEmail: {
        msg: 'Por favor, forneça um email válido'
      },
      notEmpty: {
        msg: 'Email é obrigatório'
      }
    }
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Nome é obrigatório'
      }
    }
  },
  senha: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: {
        args: [6],
        msg: 'A senha deve ter no mínimo 6 caracteres'
      },
      notEmpty: {
        msg: 'Senha é obrigatória'
      }
    }
  },
  data_nascimento: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Data de nascimento é obrigatória'
      }
    }
  }
}, {
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('senha')) {
        const salt = await bcrypt.genSalt(10);
        user.senha = await bcrypt.hash(user.senha, salt);
      }
    }
  }
});

// Método para comparar senhas
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.senha);
};

// Método para remover senha do objeto
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.senha;
  return values;
};

module.exports = User; 