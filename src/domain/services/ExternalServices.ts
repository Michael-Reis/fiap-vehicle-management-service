export interface NotificacaoVendaService {
  notificarVendaConcluida(veiculoId: string, cpfComprador: string, codigoPagamento: string): Promise<void>;
  notificarVendaCancelada(veiculoId: string, codigoPagamento: string): Promise<void>;
}

export interface ConsultaVeiculoService {
  verificarDisponibilidade(veiculoId: string): Promise<boolean>;
  obterDadosVeiculo(veiculoId: string): Promise<any>;
}

export class ExternalServices implements NotificacaoVendaService, ConsultaVeiculoService {
  private readonly baseUrl: string = 'https://api-externa.exemplo.com';
  private readonly timeout: number = 5000; // 5 segundos

  private async makeRequest(method: 'get' | 'post', url: string, data?: any, headers?: any) {
    const axios = require('axios');
    const config = {
      timeout: this.timeout,
      headers: headers || {}
    };

    if (method === 'get') {
      return await axios.get(url, config);
    } else {
      return await axios.post(url, data, config);
    }
  }

  private async retryRequest(fn: () => Promise<any>, maxRetries: number = 3): Promise<any> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Backoff
      }
    }
  }

  async validarCPF(cpf: string): Promise<boolean> {
    try {
      // Implementação com retry logic
      const response = await this.retryRequest(() => 
        this.makeRequest('get', `${this.baseUrl}/validar-cpf/${cpf}`)
      );
      return response.data.valid;
    } catch (error) {
      // Fallback para validação local de CPF
      return this.validarCPFLocal(cpf);
    }
  }

  private validarCPFLocal(cpf: string): boolean {
    // Remove caracteres não numéricos
    const cleanCPF = cpf.replace(/[^\d]/g, '');
    
    // Verifica se tem 11 dígitos
    if (cleanCPF.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cleanCPF)) return false;
    
    // Validação dos dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF[i]) * (10 - i);
    }
    let firstDigit = 11 - (sum % 11);
    if (firstDigit >= 10) firstDigit = 0;
    
    if (parseInt(cleanCPF[9]) !== firstDigit) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF[i]) * (11 - i);
    }
    let secondDigit = 11 - (sum % 11);
    if (secondDigit >= 10) secondDigit = 0;
    
    return parseInt(cleanCPF[10]) === secondDigit;
  }

  async validarEmail(email: string): Promise<boolean> {
    try {
      // Implementação simulada para validação de email
      const axios = require('axios');
      const response = await axios.get(`${this.baseUrl}/validar-email/${email}`);
      return response.data.valid;
    } catch (error) {
      return false;
    }
  }

  async processarPagamento(dados: {
    valor: number;
    cpfComprador: string;
    veiculoId: string;
    metodoPagamento: string;
  }): Promise<{ success: boolean; paymentId?: string; status?: string; transactionId?: string; error?: string }> {
    try {
      const response = await this.makeRequest('post', `${this.baseUrl}/payments`, dados, {
        'Content-Type': 'application/json'
      });
      
      // Verifica se o pagamento foi rejeitado
      if (response.data.status === 'rejected') {
        return {
          success: false,
          error: response.data.error || 'Pagamento rejeitado'
        };
      }
      
      return {
        success: true,
        paymentId: response.data.id,
        status: response.data.status,
        transactionId: response.data.transactionId
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro na comunicação com gateway de pagamento'
      };
    }
  }

  async enviarNotificacao(dados: {
    destinatario: string;
    assunto?: string;
    mensagem: string;
    tipo: string;
  }): Promise<boolean> {
    try {
      const axios = require('axios');
      await axios.post(`${this.baseUrl}/notifications`, dados);
      return true;
    } catch (error) {
      return false;
    }
  }

  async consultarCEP(cep: string): Promise<any> {
    try {
      const axios = require('axios');
      const response = await axios.get(`${this.baseUrl}/cep/${cep}`);
      
      if (response.data.erro) {
        return null;
      }
      
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async notificarVendaConcluida(veiculoId: string, cpfComprador: string, codigoPagamento: string): Promise<void> {
    try {
      const axios = require('axios');
      await axios.post(`${this.baseUrl}/notificar-venda`, {
        veiculoId,
        cpfComprador,
        codigoPagamento,
        status: 'concluida'
      });
    } catch (error) {
      console.error('Erro ao notificar venda concluída:', error);
    }
  }

  async notificarVendaCancelada(veiculoId: string, codigoPagamento: string): Promise<void> {
    try {
      const axios = require('axios');
      await axios.post(`${this.baseUrl}/notificar-venda`, {
        veiculoId,
        codigoPagamento,
        status: 'cancelada'
      });
    } catch (error) {
      console.error('Erro ao notificar venda cancelada:', error);
    }
  }

  async verificarDisponibilidade(veiculoId: string): Promise<boolean> {
    try {
      const axios = require('axios');
      const response = await axios.get(`${this.baseUrl}/veiculo/${veiculoId}/disponibilidade`);
      return response.data.disponivel;
    } catch (error) {
      return false;
    }
  }

  async obterDadosVeiculo(veiculoId: string): Promise<any> {
    try {
      const axios = require('axios');
      const response = await axios.get(`${this.baseUrl}/veiculo/${veiculoId}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }
}
