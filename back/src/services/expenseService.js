const { Op } = require('sequelize');
const MonthlyLimit = require('../models/MonthlyLimit');
const Expense = require('../models/Expense');

class ExpenseService {
  //Verificar se mes/ano é atual ou futuro
  isCurrentOrFutureMonth(mes, ano) {
    const dataAtual = new Date();
    const mesAtual = dataAtual.getMonth() + 1;
    const anoAtual = dataAtual.getFullYear();
    
    return (ano > anoAtual) || (ano === anoAtual && mes >= mesAtual);
  }

  //Verificar se despesa/limite é do mes passado
  isPastMonth(mes, ano) {
    const dataAtual = new Date();
    const mesAtual = dataAtual.getMonth() + 1;
    const anoAtual = dataAtual.getFullYear();
    
    return (ano < anoAtual) || (ano === anoAtual && mes < mesAtual);
  }

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

    //Atualiza o status do limite do mês
    const data = new Date(dados.data);
    await this.atualizarStatusLimite(email, data.getMonth() + 1, data.getFullYear());

    return despesa;
  }

  //Editar despesa com validação de negócio
  async editarDespesa(email, despesaId, dados) {
    const despesa = await Expense.findOne({
      where: { id: despesaId, email }
    });

    if (!despesa) {
      throw new Error('Despesa não encontrada');
    }

    //Verificar se a despesa não é de mês passado
    const dataOriginal = new Date(despesa.data);
    const mesOriginal = dataOriginal.getMonth() + 1;
    const anoOriginal = dataOriginal.getFullYear();

    if (this.isPastMonth(mesOriginal, anoOriginal)) {
      throw new Error('Não é possível editar despesas de meses passados');
    }

    //Atualizar a despesa
    await despesa.update(dados);

    //Atualizar status dos limites (mês original e novo mês se mudou)
    await this.atualizarStatusLimite(email, mesOriginal, anoOriginal);
    
    if (dados.data) {
      const novaData = new Date(dados.data);
      const novoMes = novaData.getMonth() + 1;
      const novoAno = novaData.getFullYear();
      
      if (novoMes !== mesOriginal || novoAno !== anoOriginal) {
        await this.atualizarStatusLimite(email, novoMes, novoAno);
      }
    }

    return despesa;
  }

  //Excluir despesa com validação de negócio
  async excluirDespesa(email, despesaId) {
    const despesa = await Expense.findOne({
      where: { id: despesaId, email }
    });

    if (!despesa) {
      throw new Error('Despesa não encontrada');
    }

    //Verificar se a despesa não é de mês passado
    const data = new Date(despesa.data);
    const mes = data.getMonth() + 1;
    const ano = data.getFullYear();

    if (this.isPastMonth(mes, ano)) {
      throw new Error('Não é possível excluir despesas de meses passados');
    }

    //Excluir a despesa
    await despesa.destroy();

    //Atualizar status do limite
    await this.atualizarStatusLimite(email, mes, ano);

    return true;
  }

  async definirLimiteMensal(email, mes, ano, valor) {
    //Validar se é mês atual ou futuro
    if (!this.isCurrentOrFutureMonth(mes, ano)) {
      throw new Error('Limite só pode ser cadastrado para o mês atual ou futuro');
    }

    const [limite, created] = await MonthlyLimit.findOrCreate({
      where: { email, mes, ano },
      defaults: { limite: valor }
    });

    if (!created) {
      //Se não é mês passado, permite editar
      if (this.isPastMonth(mes, ano)) {
        throw new Error('Não é possível editar limites de meses passados');
      }
      await limite.update({ limite: valor });
    }

    await this.atualizarStatusLimite(email, mes, ano);
    return limite;
  }

  //Excluir limite mensal com validação de negócio
  async excluirLimiteMensal(email, limiteId) {
    const limite = await MonthlyLimit.findOne({
      where: { id: limiteId, email }
    });

    if (!limite) {
      throw new Error('Limite não encontrado');
    }

    //Verificar se não é mês passado
    if (this.isPastMonth(limite.mes, limite.ano)) {
      throw new Error('Não é possível excluir limites de meses passados');
    }

    //Excluir o limite
    await limite.destroy();

    return true;
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
      limiteId: limite ? limite.id : null,
      totalDespesas,
      status: limite ? limite.status : 'sem_limite',
      despesas
    };
  }
}

module.exports = new ExpenseService(); 