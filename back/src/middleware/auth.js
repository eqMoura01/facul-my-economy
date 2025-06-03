const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;

    // Verificar se o token existe no header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'erro',
        mensagem: 'Você não está logado. Por favor, faça login para ter acesso.'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar se usuário ainda existe
    const usuario = await User.findByPk(decoded.email);
    if (!usuario) {
      return res.status(401).json({
        status: 'erro',
        mensagem: 'O usuário não existe mais.'
      });
    }

    // Adicionar usuário ao request
    req.usuario = usuario;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'erro',
      mensagem: 'Token inválido ou expirado'
    });
  }
}; 