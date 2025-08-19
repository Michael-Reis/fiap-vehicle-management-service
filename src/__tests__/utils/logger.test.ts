describe('Logger', () => {
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
    jest.clearAllMocks();
    jest.resetModules();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    jest.restoreAllMocks();
  });

  describe('em ambiente de desenvolvimento', () => {
    it('deve logar info', () => {
      process.env.NODE_ENV = 'development';
      const { Logger } = require('../../utils/logger');
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      Logger.info('Teste');
      
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('deve logar erro', () => {
      process.env.NODE_ENV = 'development';
      const { Logger } = require('../../utils/logger');
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      Logger.error('Erro');
      
      expect(errorSpy).toHaveBeenCalled();
    });

    it('deve logar warning', () => {
      process.env.NODE_ENV = 'development';
      const { Logger } = require('../../utils/logger');
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      Logger.warn('Warning');
      
      expect(warnSpy).toHaveBeenCalled();
    });

    it('deve logar debug', () => {
      process.env.NODE_ENV = 'development';
      const { Logger } = require('../../utils/logger');
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      Logger.debug('Debug');
      
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('deve tratar parâmetros undefined', () => {
      process.env.NODE_ENV = 'development';
      const { Logger } = require('../../utils/logger');
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      Logger.info('Teste', undefined);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Teste'),
        ''
      );
    });
  });

  describe('em ambiente de produção', () => {
    it('não deve logar em produção', () => {
      process.env.NODE_ENV = 'production';
      const { Logger } = require('../../utils/logger');
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      Logger.info('Info produção');
      
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('não deve logar erro em produção', () => {
      process.env.NODE_ENV = 'production';
      const { Logger } = require('../../utils/logger');
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      Logger.error('Erro produção');
      
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });
});
