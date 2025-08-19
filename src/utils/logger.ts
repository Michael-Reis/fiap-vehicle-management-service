/**
 * Sistema de logging seguro para produção
 */
export class Logger {
  private static isDevelopment = process.env.NODE_ENV === 'development';

  static info(message: string, meta?: any): void {
    if (this.isDevelopment) {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta || '');
    }
    // Em produção, enviar para serviço de logging (Winston, etc.)
  }

  static error(message: string, error?: any): void {
    if (this.isDevelopment) {
      console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '');
    }
    // Em produção, enviar para serviço de logging
  }

  static warn(message: string, meta?: any): void {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta || '');
    }
    // Em produção, enviar para serviço de logging
  }

  static debug(message: string, meta?: any): void {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, meta || '');
    }
    // Debug logs só em desenvolvimento
  }

  /**
   * Log de requisições HTTP - sem informações sensíveis
   */
  static httpRequest(method: string, path: string, statusCode?: number): void {
    // Remove informações sensíveis da URL
    const sanitizedPath = this.sanitizePath(path);
    this.info(`HTTP ${method} ${sanitizedPath}${statusCode ? ` - ${statusCode}` : ''}`);
  }

  /**
   * Remove parâmetros sensíveis da URL para logging
   */
  private static sanitizePath(path: string): string {
    return path
      .replace(/\b\d{11}\b/g, '[CPF]') // CPFs
      .replace(/\b\d{4,}\b/g, '[ID]') // IDs longos
      .replace(/password=[^&]*/gi, 'password=[HIDDEN]')
      .replace(/token=[^&]*/gi, 'token=[HIDDEN]');
  }
}
