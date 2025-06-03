const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Gerar token JWT
const generateToken = (email) => {
  return jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Criar novo usuário
exports.criarUsuario = async (req, res) => {
  try {
    const { nome, email, senha, data_nascimento } = req.body;

    // Verificar se usuário já existe
    const usuarioExistente = await User.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({
        status: 'erro',
        mensagem: 'Email já cadastrado'
      });
    }

    // Criar novo usuário
    const usuario = await User.create({
      nome,
      email,
      senha,
      data_nascimento
    });

    // Gerar token
    const token = generateToken(usuario.email);

    res.status(201).json({
      status: 'sucesso',
      token,
      data: {
        usuario
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'erro',
      mensagem: error.message
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Verificar se email e senha foram fornecidos
    if (!email || !senha) {
      return res.status(400).json({
        status: 'erro',
        mensagem: 'Por favor, forneça email e senha'
      });
    }

    // Buscar usuário
    const usuario = await User.findOne({ where: { email } });

    // Verificar se usuário existe e senha está correta
    if (!usuario || !(await usuario.comparePassword(senha))) {
      return res.status(401).json({
        status: 'erro',
        mensagem: 'Email ou senha incorretos'
      });
    }

    // Gerar token
    const token = generateToken(usuario.email);

    res.status(200).json({
      status: 'sucesso',
      token,
      data: {
        usuario
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'erro',
      mensagem: error.message
    });
  }
};

// Buscar usuário atual
exports.getMe = async (req, res) => {
  try {
    const usuario = await User.findByPk(req.usuario.email);
    
    res.status(200).json({
      status: 'sucesso',
      data: {
        usuario
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'erro',
      mensagem: error.message
    });
  }
};

// Atualizar usuário
exports.atualizarUsuario = async (req, res) => {
  try {
    // Não permitir atualização de senha por esta rota
    if (req.body.senha) {
      return res.status(400).json({
        status: 'erro',
        mensagem: 'Esta rota não é para atualização de senha'
      });
    }

    const usuario = await User.findByPk(req.usuario.email);
    if (!usuario) {
      return res.status(404).json({
        status: 'erro',
        mensagem: 'Usuário não encontrado'
      });
    }

    await usuario.update(req.body);

    res.status(200).json({
      status: 'sucesso',
      data: {
        usuario
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'erro',
      mensagem: error.message
    });
  }
};

// Deletar usuário
exports.deletarUsuario = async (req, res) => {
  try {
    const usuario = await User.findByPk(req.usuario.email);
    if (!usuario) {
      return res.status(404).json({
        status: 'erro',
        mensagem: 'Usuário não encontrado'
      });
    }

    await usuario.destroy();

    res.status(204).json({
      status: 'sucesso',
      data: null
    });
  } catch (error) {
    res.status(400).json({
      status: 'erro',
      mensagem: error.message
    });
  }
}; 