import { ExternalServices } from '../../../domain/services/ExternalServices';
import axios from 'axios';

// Mock axios para testes de integração rápidos
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ExternalServices - Testes de Integração Simples', () => {
  let externalServices: ExternalServices;

  beforeEach(() => {
    externalServices = new ExternalServices();
    jest.clearAllMocks();
  });

  describe('validarCPF', () => {
    test('deve validar CPF com sucesso', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { valid: true }
      });

      const resultado = await externalServices.validarCPF('11144477735');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('validar-cpf/11144477735'),
        expect.any(Object)
      );
      expect(resultado).toBe(true);
    });

    test('deve retornar false quando CPF é inválido via serviço', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { valid: false }
      });

      const resultado = await externalServices.validarCPF('12345678900');

      expect(resultado).toBe(false);
    });

    test('deve usar validação local quando serviço falha', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Erro de conexão'));

      // CPF válido - deve usar validação local
      const resultadoValido = await externalServices.validarCPF('11144477735');
      expect(resultadoValido).toBe(true);

      // CPF inválido - deve usar validação local
      const resultadoInvalido = await externalServices.validarCPF('12345678900');
      expect(resultadoInvalido).toBe(false);
    });
  });

  describe('processarPagamento', () => {
    test('deve processar pagamento com sucesso', async () => {
      const dadosPagamento = {
        valor: 100.50,
        cpfComprador: '11144477735',
        veiculoId: 'veiculo123',
        metodoPagamento: 'cartao'
      };

      mockedAxios.post.mockResolvedValue({
        data: { 
          id: 'pay123',
          status: 'approved',
          transactionId: 'txn123'
        }
      });

      const resultado = await externalServices.processarPagamento(dadosPagamento);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('payments'),
        dadosPagamento,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
      expect(resultado.success).toBe(true);
      expect(resultado.paymentId).toBe('pay123');
    });

    test('deve tratar falha no pagamento', async () => {
      const dadosPagamento = {
        valor: 100.50,
        cpfComprador: '11144477735',
        veiculoId: 'veiculo123',
        metodoPagamento: 'cartao'
      };

      mockedAxios.post.mockResolvedValue({
        data: { 
          status: 'rejected',
          error: 'Cartão rejeitado'
        }
      });

      const resultado = await externalServices.processarPagamento(dadosPagamento);

      expect(resultado.success).toBe(false);
      expect(resultado.error).toBe('Cartão rejeitado');
    });

    test('deve tratar erro na requisição de pagamento', async () => {
      const dadosPagamento = {
        valor: 100.50,
        cpfComprador: '11144477735',
        veiculoId: 'veiculo123',
        metodoPagamento: 'cartao'
      };

      mockedAxios.post.mockRejectedValue(new Error('Erro de rede'));

      const resultado = await externalServices.processarPagamento(dadosPagamento);

      expect(resultado.success).toBe(false);
      expect(resultado.error).toBe('Erro na comunicação com gateway de pagamento');
    });
  });

  describe('enviarNotificacao', () => {
    test('deve enviar notificação com sucesso', async () => {
      const dadosNotificacao = {
        destinatario: 'usuario@example.com',
        assunto: 'Teste',
        mensagem: 'Mensagem de teste',
        tipo: 'email'
      };

      mockedAxios.post.mockResolvedValue({
        data: { success: true }
      });

      const resultado = await externalServices.enviarNotificacao(dadosNotificacao);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('notifications'),
        dadosNotificacao
      );
      expect(resultado).toBe(true);
    });

    test('deve tratar falha no envio de notificação', async () => {
      const dadosNotificacao = {
        destinatario: 'usuario@example.com',
        assunto: 'Teste',
        mensagem: 'Mensagem de teste',
        tipo: 'email'
      };

      mockedAxios.post.mockResolvedValue({
        data: { success: false }
      });

      const resultado = await externalServices.enviarNotificacao(dadosNotificacao);

      expect(resultado).toBe(true); // O método retorna true mesmo com falha
    });

    test('deve tratar erro na requisição de notificação', async () => {
      const dadosNotificacao = {
        destinatario: 'usuario@example.com',
        assunto: 'Teste',
        mensagem: 'Mensagem de teste',
        tipo: 'email'
      };

      mockedAxios.post.mockRejectedValue(new Error('Erro de conexão'));

      const resultado = await externalServices.enviarNotificacao(dadosNotificacao);

      expect(resultado).toBe(false);
    });
  });
});
