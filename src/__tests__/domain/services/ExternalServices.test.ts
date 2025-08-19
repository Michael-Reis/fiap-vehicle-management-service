import { ExternalServices } from '../../../domain/services/ExternalServices';
import axios from 'axios';

// Mock do axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ExternalServices', () => {
  let externalServices: ExternalServices;

  beforeEach(() => {
    externalServices = new ExternalServices();
    jest.clearAllMocks();
  });

  describe('validarCPF', () => {
    it('deve validar CPF válido', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { valid: true },
        status: 200
      });

      const resultado = await externalServices.validarCPF('12345678900');

      expect(resultado).toBe(true);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('12345678900'),
        expect.objectContaining({
          timeout: 5000,
          headers: {}
        })
      );
    });

    it('deve invalidar CPF inválido', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { valid: false },
        status: 200
      });

      const resultado = await externalServices.validarCPF('12345678901');

      expect(resultado).toBe(false);
    });

    it('deve tratar erro de serviço externo', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Serviço indisponível'));

      const resultado = await externalServices.validarCPF('12345678900');

      expect(resultado).toBe(false);
    });

    it('deve validar CPF offline quando serviço falha', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      // CPF válido conhecido
      const resultado = await externalServices.validarCPF('11144477735');

      // Deve usar validação local como fallback
      expect(resultado).toBe(true);
    });
  });

  describe('processarPagamento', () => {
    const dadosPagamento = {
      valor: 85000,
      cpfComprador: '12345678900',
      veiculoId: 'veh_123',
      metodoPagamento: 'PIX'
    };

    it('deve processar pagamento com sucesso', async () => {
      const responsePagamento = {
        data: {
          id: 'pay_123456',
          status: 'approved',
          transactionId: 'txn_789'
        },
        status: 200
      };

      mockedAxios.post.mockResolvedValue(responsePagamento);

      const resultado = await externalServices.processarPagamento(dadosPagamento);

      expect(resultado).toEqual({
        success: true,
        paymentId: 'pay_123456',
        status: 'approved',
        transactionId: 'txn_789'
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/payments'),
        dadosPagamento,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('deve tratar falha no pagamento', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          id: 'pay_123456',
          status: 'rejected',
          error: 'Cartão inválido'
        },
        status: 200
      });

      const resultado = await externalServices.processarPagamento(dadosPagamento);

      expect(resultado).toEqual({
        success: false,
        error: 'Cartão inválido'
      });
    });

    it('deve tratar erro de conexão com gateway', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Gateway timeout'));

      const resultado = await externalServices.processarPagamento(dadosPagamento);

      expect(resultado).toEqual({
        success: false,
        error: 'Erro na comunicação com gateway de pagamento'
      });
    });
  });

  describe('enviarNotificacao', () => {
    const dadosNotificacao = {
      destinatario: 'user@email.com',
      assunto: 'Compra aprovada',
      mensagem: 'Seu veículo foi comprado com sucesso',
      tipo: 'email'
    };

    it('deve enviar notificação por email', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { messageId: 'msg_123', status: 'sent' },
        status: 200
      });

      const resultado = await externalServices.enviarNotificacao(dadosNotificacao);

      expect(resultado).toBe(true);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/notifications'),
        dadosNotificacao
      );
    });

    it('deve tratar falha no envio de notificação', async () => {
      mockedAxios.post.mockRejectedValue(new Error('SMTP error'));

      const resultado = await externalServices.enviarNotificacao(dadosNotificacao);

      expect(resultado).toBe(false);
    });

    it('deve enviar notificação SMS', async () => {
      const dadosSMS = {
        ...dadosNotificacao,
        destinatario: '+5511999999999',
        tipo: 'sms'
      };

      mockedAxios.post.mockResolvedValue({
        data: { messageId: 'sms_123', status: 'sent' },
        status: 200
      });

      const resultado = await externalServices.enviarNotificacao(dadosSMS);

      expect(resultado).toBe(true);
    });
  });

  describe('consultarCEP', () => {
    it('deve consultar CEP válido', async () => {
      const dadosCEP = {
        cep: '01310-100',
        logradouro: 'Avenida Paulista',
        bairro: 'Bela Vista',
        localidade: 'São Paulo',
        uf: 'SP'
      };

      mockedAxios.get.mockResolvedValue({
        data: dadosCEP,
        status: 200
      });

      const resultado = await externalServices.consultarCEP('01310100');

      expect(resultado).toEqual(dadosCEP);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('01310100')
      );
    });

    it('deve tratar CEP não encontrado', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { erro: true },
        status: 200
      });

      const resultado = await externalServices.consultarCEP('00000000');

      expect(resultado).toBeNull();
    });

    it('deve tratar erro de serviço de CEP', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Service unavailable'));

      const resultado = await externalServices.consultarCEP('01310100');

      expect(resultado).toBeNull();
    });
  });

  describe('validarEmail', () => {
    it('deve validar email válido', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { valid: true },
        status: 200
      });

      const resultado = await externalServices.validarEmail('test@example.com');

      expect(resultado).toBe(true);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('validar-email/test@example.com')
      );
    });

    it('deve invalidar email inválido', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { valid: false },
        status: 200
      });

      const resultado = await externalServices.validarEmail('invalid-email');

      expect(resultado).toBe(false);
    });

    it('deve tratar erro de serviço de email', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Service unavailable'));

      const resultado = await externalServices.validarEmail('test@example.com');

      expect(resultado).toBe(false);
    });
  });

  describe('makeRequest', () => {
    it('deve fazer requisição GET com sucesso', async () => {
      const responseData = { data: 'test' };
      mockedAxios.get.mockResolvedValue({
        data: responseData,
        status: 200
      });

      const result = await (externalServices as any).makeRequest('get', 'http://test.com', null, {});

      expect(result.data).toEqual(responseData);
      expect(result.status).toBe(200);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://test.com',
        expect.objectContaining({
          timeout: 5000,
          headers: {}
        })
      );
    });

    it('deve fazer requisição POST com sucesso', async () => {
      const postData = { test: 'data' };
      const responseData = { success: true };
      mockedAxios.post.mockResolvedValue({
        data: responseData,
        status: 200
      });

      const result = await (externalServices as any).makeRequest('post', 'http://test.com', postData, {});

      expect(result.data).toEqual(responseData);
      expect(result.status).toBe(200);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://test.com',
        postData,
        expect.objectContaining({
          timeout: 5000,
          headers: {}
        })
      );
    });

    it('deve propagar erro de requisição', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      await expect((externalServices as any).makeRequest('get', 'http://test.com', null, {}))
        .rejects
        .toThrow('Network error');
    });
  });
});
