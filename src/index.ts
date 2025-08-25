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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;



app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
      connectSrc: ["'self'", "http://fiap-vehicle-management-alb-1408414491.us-east-1.elb.amazonaws.com", "http://localhost:3000"],
      upgradeInsecureRequests: null,
    },
  },
  crossOriginOpenerPolicy: false,
  hsts: false,
}));
app.use(cors(
  {
    origin: process.env.origins || '*', // Permitir todas as origens (ajustar conforme necessário)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }
));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Muitas requisições feitas a partir deste IP, tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Serviço Principal - Gestão de Veículos',
    timestamp: new Date().toISOString()
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API - Serviço Principal de Veículos'
}));

app.use('/api/auth', authRoutes);

app.use('/api/veiculos', veiculoRoutes);

app.use('/api/webhook', webhookRoutes);

app.use('/api/webhooks', (req, res) => {
  res.status(501).json({ message: 'Rotas de webhooks em desenvolvimento' });
});

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Erro capturado:', {
    name: error.name,
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    url: req.url,
    method: req.method,
    body: req.body
  });
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: error.message
    });
  }
  
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Não autorizado',
      message: 'Token inválido ou expirado'
    });
  }
  
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'JSON malformado',
      message: 'O JSON enviado contém erros de sintaxe. Verifique vírgulas, aspas e chaves.',
      details: error.message,
      hint: 'Comum: vírgula extra no final de propriedades ou aspas não fechadas'
    });
  }
  
  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Payload muito grande',
      message: 'O tamanho dos dados enviados excede o limite permitido'
    });
  }
  
  return res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo deu errado',
    timestamp: new Date().toISOString()
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    path: req.originalUrl
  });
});

async function startServer() {
  try {
    const db = DatabaseConnection.getInstance();
    try {
      await db.connect();
      await db.initializeSchema();
      console.log('Banco de dados conectado com sucesso');
      
      const seed = new DatabaseSeed();
      await seed.criarAdminInicial();
      
    } catch (dbError) {
      console.log("Não foi possível conectar ao banco de dados:", dbError); 
    }
    
    app.listen(PORT, () => {
      console.log(`Serviço Principal rodando na porta ${PORT}`);
      console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`Documentação da API: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Erro crítico ao inicializar o servidor:', error);
    process.exit(1);
  }
}

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

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;