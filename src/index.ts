import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { DatabaseConnection } from './infrastructure/database/DatabaseConnection';
import { DatabaseSeed } from './infrastructure/database/seed';
import { swaggerUi, specs } from './infrastructure/swagger/swagger';
import authRoutes from './infrastructure/http/routes/authRoutes';
import veiculoRoutes from './infrastructure/http/routes/veiculoRoutes';
import webhookRoutes from './infrastructure/http/routes/webhookRoutes';

// Carrega variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares de segurança
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // máximo 100 requests por windowMs
  message: 'Muitas requisições feitas a partir deste IP, tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Middleware para parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware para tratar erros de JSON malformado
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error instanceof SyntaxError && (error as any).status === 400 && 'body' in error) {
    console.error('❌ JSON malformado recebido:', {
      method: req.method,
      url: req.url,
      body: (error as any).body,
      error: error.message
    });
    
    res.status(400).json({
      error: 'JSON malformado',
      message: 'O JSON enviado contém erros de sintaxe. Verifique vírgulas, aspas e chaves.',
      details: error.message,
      receivedBody: (error as any).body
    });
    return;
  }
  next(error);
});

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Verifica a saúde do serviço
 *     description: Endpoint para verificar se o serviço está funcionando corretamente
 *     responses:
 *       200:
 *         description: Serviço funcionando normalmente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Serviço Principal - Gestão de Veículos',
    timestamp: new Date().toISOString()
  });
});

// Documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API - Serviço Principal de Veículos'
}));

// Rotas da API
// Rotas de autenticação
app.use('/api/auth', authRoutes);

// Rotas de veículos
app.use('/api/veiculos', veiculoRoutes);

// Rotas de webhook
app.use('/api/webhook', webhookRoutes);

// TODO: Implementar rotas de webhooks
app.use('/api/webhooks', (req, res) => {
  res.status(501).json({ message: 'Rotas de webhooks em desenvolvimento' });
});

// Middleware de tratamento de erros
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Erro capturado:', {
    name: error.name,
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    url: req.url,
    method: req.method,
    body: req.body
  });
  
  // Erros de validação
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: error.message
    });
  }
  
  // Erros de autorização
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Não autorizado',
      message: 'Token inválido ou expirado'
    });
  }
  
  // Erros de parsing JSON (caso não tenha sido capturado pelo middleware anterior)
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'JSON malformado',
      message: 'O JSON enviado contém erros de sintaxe. Verifique vírgulas, aspas e chaves.',
      details: error.message,
      hint: 'Comum: vírgula extra no final de propriedades ou aspas não fechadas'
    });
  }
  
  // Erros de tamanho do payload
  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Payload muito grande',
      message: 'O tamanho dos dados enviados excede o limite permitido'
    });
  }
  
  // Erro interno genérico
  return res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo deu errado',
    timestamp: new Date().toISOString()
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    path: req.originalUrl
  });
});

// Função para inicializar o servidor
async function startServer() {
  try {
    // Tentar conectar ao banco de dados
    const db = DatabaseConnection.getInstance();
    try {
      await db.connect();
      await db.initializeSchema();
      console.log('✅ Banco de dados conectado com sucesso');
      
      // Executar seed para criar admin inicial
      const seed = new DatabaseSeed();
      await seed.criarAdminInicial();
      
    } catch (dbError) {
      console.warn('⚠️  Não foi possível conectar ao MySQL. Verifique se o XAMPP está rodando.');
      console.warn('⚠️  O serviço continuará funcionando, mas sem persistência de dados.');
      console.warn('   Para conectar ao MySQL: inicie o XAMPP e certifique-se que o MySQL está rodando');
    }
    
    // Iniciar o servidor
    app.listen(PORT, () => {
      console.log(`🚗 Serviço Principal rodando na porta ${PORT}`);
      console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 Documentação da API: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Erro crítico ao inicializar o servidor:', error);
    process.exit(1);
  }
}

// Tratamento de sinais do sistema
process.on('SIGTERM', async () => {
  console.log('SIGTERM recebido, fechando servidor graciosamente...');
  const db = DatabaseConnection.getInstance();
  await db.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT recebido, fechando servidor graciosamente...');
  const db = DatabaseConnection.getInstance();
  await db.disconnect();
  process.exit(0);
});

// Inicializar o servidor apenas se não estivermos em modo de teste
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
