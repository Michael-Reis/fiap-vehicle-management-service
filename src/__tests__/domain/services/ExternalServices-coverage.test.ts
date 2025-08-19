import { ExternalServices } from '../../../domain/services/ExternalServices';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ExternalServices - Cobertura Adicional', () => {
  let externalServices: ExternalServices;

  beforeEach(() => {
    externalServices = new ExternalServices();
    jest.clearAllMocks();
  });

  describe('consultarCEP', () => {
    test('deve consultar CEP com sucesso', async () => {
      const mockResponse = { 
        data: { 
          cep: '01310-100',
          logradouro: 'Avenida Paulista',
          bairro: 'Bela Vista',
          localidade: 'São Paulo',
          uf: 'SP'
        } 
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const resultado = await externalServices.consultarCEP('01310100');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('01310100')
      );

      expect(resultado).toEqual(mockResponse.data);
    });

    test('deve retornar null quando CEP não existe', async () => {
      const mockResponse = { 
        data: { 
          erro: true
        } 
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const resultado = await externalServices.consultarCEP('00000000');

      expect(resultado).toBeNull();
    });

    test('deve retornar null quando há erro na consulta', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Service unavailable'));

      const resultado = await externalServices.consultarCEP('01310100');

      expect(resultado).toBeNull();
    });
  });

  describe('validarEmail', () => {
    test('deve validar email com sucesso', async () => {
      const mockResponse = { 
        data: { 
          valid: true
        } 
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const resultado = await externalServices.validarEmail('test@example.com');

      expect(resultado).toBe(true);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('validar-email/test@example.com')
      );
    });

    test('deve invalidar email inválido', async () => {
      const mockResponse = { 
        data: { 
          valid: false
        } 
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const resultado = await externalServices.validarEmail('invalid-email');

      expect(resultado).toBe(false);
    });

    test('deve retornar false quando há erro no serviço', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Service error'));

      const resultado = await externalServices.validarEmail('test@example.com');

      expect(resultado).toBe(false);
    });
  });

  describe('enviarNotificacao - casos específicos', () => {
    test('deve enviar notificação por email', async () => {
      mockedAxios.post.mockResolvedValue({ data: { success: true } });

      const dados = {
        destinatario: 'test@example.com',
        assunto: 'Teste',
        mensagem: 'Mensagem de teste',
        tipo: 'email'
      };

      const resultado = await externalServices.enviarNotificacao(dados);

      expect(resultado).toBe(true);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('notifications'),
        dados
      );
    });

    test('deve enviar notificação por SMS', async () => {
      mockedAxios.post.mockResolvedValue({ data: { success: true } });

      const dados = {
        destinatario: '11999999999',
        mensagem: 'Mensagem SMS',
        tipo: 'sms'
      };

      const resultado = await externalServices.enviarNotificacao(dados);

      expect(resultado).toBe(true);
    });

    test('deve retornar false quando há erro no envio', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      const dados = {
        destinatario: 'test@example.com',
        mensagem: 'Teste',
        tipo: 'email'
      };

      const resultado = await externalServices.enviarNotificacao(dados);

      expect(resultado).toBe(false);
    });
  });

  describe('processarPagamento - casos específicos', () => {
    test('deve processar pagamento rejeitado', async () => {
      const mockResponse = {
        data: {
          status: 'rejected',
          error: 'Cartão inválido'
        }
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const dados = {
        valor: 100,
        cpfComprador: '12345678901',
        veiculoId: 'veiculo123',
        metodoPagamento: 'credit_card'
      };

      const resultado = await externalServices.processarPagamento(dados);

      expect(resultado.success).toBe(false);
      expect(resultado.error).toBe('Cartão inválido');
    });

    test('deve processar pagamento com timeout ou erro genérico', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Timeout na transação'));

      const dados = {
        valor: 200,
        cpfComprador: '12345678901',
        veiculoId: 'veiculo456',
        metodoPagamento: 'debit_card'
      };

      const resultado = await externalServices.processarPagamento(dados);

      expect(resultado.success).toBe(false);
      expect(resultado.error).toBe('Erro na comunicação com gateway de pagamento');
    });

    test('deve processar pagamento com sucesso', async () => {
      const mockResponse = {
        data: {
          status: 'approved',
          id: 'pay123',
          transactionId: 'tx456'
        }
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const dados = {
        valor: 300,
        cpfComprador: '12345678901',
        veiculoId: 'veiculo789',
        metodoPagamento: 'credit_card'
      };

      const resultado = await externalServices.processarPagamento(dados);

      expect(resultado.success).toBe(true);
      expect(resultado.paymentId).toBe('pay123');
      expect(resultado.transactionId).toBe('tx456');
    });
  });

  describe('métodos de notificação de venda', () => {
    test('deve notificar venda concluída', async () => {
      mockedAxios.post.mockResolvedValue({ data: { success: true } });

      await externalServices.notificarVendaConcluida('veiculo123', '12345678901', 'pay123');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('notificar-venda'),
        {
          veiculoId: 'veiculo123',
          cpfComprador: '12345678901',
          codigoPagamento: 'pay123',
          status: 'concluida'
        }
      );
    });

    test('deve notificar venda cancelada', async () => {
      mockedAxios.post.mockResolvedValue({ data: { success: true } });

      await externalServices.notificarVendaCancelada('veiculo123', 'pay123');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('notificar-venda'),
        {
          veiculoId: 'veiculo123',
          codigoPagamento: 'pay123',
          status: 'cancelada'
        }
      );
    });
  });

  describe('métodos de consulta de veículo', () => {
    test('deve verificar disponibilidade do veículo', async () => {
      const mockResponse = { data: { disponivel: true } };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const resultado = await externalServices.verificarDisponibilidade('veiculo123');

      expect(resultado).toBe(true);
      expect(mockedAxios.get).toHaveBeenCalled();
    });

    test('deve obter dados do veículo', async () => {
      const mockResponse = { 
        data: { 
          id: 'veiculo123',
          marca: 'Toyota',
          modelo: 'Corolla'
        } 
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const resultado = await externalServices.obterDadosVeiculo('veiculo123');

      expect(resultado).toEqual(mockResponse.data);
      expect(mockedAxios.get).toHaveBeenCalled();
    });

    test('deve retornar null quando há erro na consulta do veículo', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Veículo não encontrado'));

      const resultado = await externalServices.obterDadosVeiculo('veiculo999');

      expect(resultado).toBeNull();
    });

    test('deve retornar false quando há erro na verificação de disponibilidade', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Serviço indisponível'));

      const resultado = await externalServices.verificarDisponibilidade('veiculo999');

      expect(resultado).toBe(false);
    });
  });
});
