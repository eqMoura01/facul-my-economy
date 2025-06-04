const express = require('express');
const router = express.Router();
const expenseService = require('../services/expenseService');
const { protect } = require('../middleware/auth');

// Definir limite mensal
router.post('/limite', protect, async (req, res) => {
  try {
    const { mes, ano, valor } = req.body;
    const limite = await expenseService.definirLimiteMensal(req.usuario.email, mes, ano, valor);
    res.json(limite);
  } catch (error) {
    res.status(400).json({ status: 'erro', mensagem: error.message });
  }
});

// Adicionar despesa
router.post('/despesa', protect, async (req, res) => {
  try {
    const { descricao, valor, data, categoria } = req.body;
    const despesa = await expenseService.adicionarDespesa(req.usuario.email, {
      descricao,
      valor,
      data,
      categoria
    });
    res.json(despesa);
  } catch (error) {
    res.status(400).json({ status: 'erro', mensagem: error.message });
  }
});

// Obter resumo mensal
router.get('/resumo/:mes/:ano', protect, async (req, res) => {
  try {
    const { mes, ano } = req.params;
    const resumo = await expenseService.obterResumoMensal(req.usuario.email, parseInt(mes), parseInt(ano));
    res.json(resumo);
  } catch (error) {
    res.status(400).json({ status: 'erro', mensagem: error.message });
  }
});

module.exports = router; 