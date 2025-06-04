const { Op } = require('sequelize');
const MonthlyLimit = require('../models/MonthlyLimit');
const Expense = require('../models/Expense');

class ExpenseService {
  async atualizarStatusLimite(email, mes, ano) {
    const limite = await MonthlyLimit.findOne({
      where: { email, mes, ano }
    });

    if (!limite) {
      return null;
    }

    const inicioMes = new Date(ano, mes - 1, 1);
    const fimMes = new Date(ano, mes, 0);

    const despesas = await Expense.findAll({
      where: {
        email,
        data: {
          [Op.between]: [inicioMes, fimMes]
        }
      }
    });

    const totalDespesas = despesas.reduce((sum, despesa) => sum + parseFloat(despesa.valor), 0);

    let status = 'sem_limite';
    if (limite.limite > 0) {
      status = totalDespesas <= limite.limite ? 'abaixo_limite' : 'acima_limite';
    }

    await limite.update({ status });
    return limite;
  }

  async adicionarDespesa(email, dados) {
    const despesa = await Expense.create({
      email,
      ...dados
    });

    // Atualiza o status do limite do mês
    const data = new Date(dados.data);
    await this.atualizarStatusLimite(email, data.getMonth() + 1, data.getFullYear());

    return despesa;
  }

  async definirLimiteMensal(email, mes, ano, valor) {
    const [limite, created] = await MonthlyLimit.findOrCreate({
      where: { email, mes, ano },
      defaults: { limite: valor }
    });

    if (!created) {
      await limite.update({ limite: valor });
    }

    await this.atualizarStatusLimite(email, mes, ano);
    return limite;
  }

  async obterResumoMensal(email, mes, ano) {
    const limite = await MonthlyLimit.findOne({
      where: { email, mes, ano }
    });

    const inicioMes = new Date(ano, mes - 1, 1);
    const fimMes = new Date(ano, mes, 0);

    const despesas = await Expense.findAll({
      where: {
        email,
        data: {
          [Op.between]: [inicioMes, fimMes]
        }
      }
    });

    const totalDespesas = despesas.reduce((sum, despesa) => sum + parseFloat(despesa.valor), 0);

    return {
      limite: limite ? limite.limite : 0,
      totalDespesas,
      status: limite ? limite.status : 'sem_limite',
      despesas
    };
  }
}

module.exports = new ExpenseService(); 