const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Rotas públicas
router.post('/registro', userController.criarUsuario);
router.post('/login', userController.login);

// Rotas protegidas
router.use(protect); // Todas as rotas abaixo precisam de autenticação
router.get('/me', userController.getMe);
router.patch('/atualizar', userController.atualizarUsuario);
router.delete('/deletar', userController.deletarUsuario);

module.exports = router; 