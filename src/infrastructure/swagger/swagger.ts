import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Serviço Principal - Gestão de Veículos',
      version: '1.0.0',
      description: `
        API para gestão de veículos do sistema de revenda automotiva.
        
        ## Funcionalidades
        - Cadastro e gestão de veículos
        - Edição de dados dos veículos  
        - Controle de status (disponível/vendido)
        - Webhooks de pagamento
        - Consultas de disponibilidade
        
        ## Arquitetura
        Este serviço utiliza **Arquitetura Hexagonal** (Clean Architecture) com **TypeScript** e **Express.js**.
      `,
      contact: {
        name: 'FIAP - Pós Tech',
        email: 'contato@exemplo.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desenvolvimento'
      }
    ],
    tags: [
      {
        name: 'Autenticação',
        description: 'Operações de registro e login de usuários'
      },
      {
        name: 'Veículos',
        description: 'Operações relacionadas à gestão de veículos'
      },
      {
        name: 'Webhooks',
        description: 'Endpoints para receber notificações de pagamento'
      },
      {
        name: 'Health',
        description: 'Verificação de saúde do serviço'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Usuario: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID único do usuário',
              example: 'usr_1692287654321_abc123'
            },
            nome: {
              type: 'string',
              description: 'Nome completo do usuário',
              example: 'João Silva'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário',
              example: 'joao@exemplo.com'
            },
            tipo: {
              type: 'string',
              enum: ['ADMIN', 'CLIENTE'],
              description: 'Tipo do usuário',
              example: 'CLIENTE'
            },
            ativo: {
              type: 'boolean',
              description: 'Se o usuário está ativo',
              example: true
            },
            cpf: {
              type: 'string',
              pattern: '^[0-9]{11}$',
              description: 'CPF do usuário (obrigatório para clientes)',
              example: '12345678901'
            },
            telefone: {
              type: 'string',
              description: 'Telefone do usuário',
              example: '(11) 99999-9999'
            },
            endereco: {
              type: 'string',
              description: 'Endereço do usuário',
              example: 'Rua das Flores, 123'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação do registro'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data da última atualização'
            }
          }
        },
        Veiculo: {
          type: 'object',
          required: ['marca', 'modelo', 'ano', 'cor', 'preco'],
          properties: {
            id: {
              type: 'string',
              description: 'ID único do veículo',
              example: 'veh_1692287654321_abc123def'
            },
            marca: {
              type: 'string',
              description: 'Marca do veículo',
              example: 'Toyota'
            },
            modelo: {
              type: 'string',
              description: 'Modelo do veículo',
              example: 'Corolla'
            },
            ano: {
              type: 'integer',
              minimum: 1900,
              maximum: 2026,
              description: 'Ano do veículo',
              example: 2023
            },
            cor: {
              type: 'string',
              description: 'Cor do veículo',
              example: 'Branco'
            },
            preco: {
              type: 'number',
              minimum: 0.01,
              description: 'Preço do veículo em reais',
              example: 85000.00
            },
            status: {
              type: 'string',
              enum: ['A_VENDA', 'VENDIDO', 'RESERVADO'],
              description: 'Status atual do veículo',
              example: 'A_VENDA'
            },
            cpfComprador: {
              type: 'string',
              pattern: '^[0-9]{11}$',
              description: 'CPF do comprador (somente números)',
              example: '12345678901'
            },
            dataVenda: {
              type: 'string',
              format: 'date-time',
              description: 'Data e hora da venda',
              example: '2023-08-17T14:30:00Z'
            },
            codigoPagamento: {
              type: 'string',
              description: 'Código único do pagamento',
              example: 'PAY_abc123def456'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação do registro'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data da última atualização'
            }
          }
        },
        VeiculoInput: {
          type: 'object',
          required: ['marca', 'modelo', 'ano', 'cor', 'preco'],
          properties: {
            marca: {
              type: 'string',
              description: 'Marca do veículo',
              example: 'Toyota'
            },
            modelo: {
              type: 'string',
              description: 'Modelo do veículo',
              example: 'Corolla'
            },
            ano: {
              type: 'integer',
              minimum: 1900,
              maximum: 2026,
              description: 'Ano do veículo',
              example: 2023
            },
            cor: {
              type: 'string',
              description: 'Cor do veículo',
              example: 'Branco'
            },
            preco: {
              type: 'number',
              minimum: 0.01,
              description: 'Preço do veículo em reais',
              example: 85000.00
            }
          }
        },
        WebhookPagamento: {
          type: 'object',
          required: ['codigoPagamento', 'status'],
          properties: {
            codigoPagamento: {
              type: 'string',
              description: 'Código único do pagamento',
              example: 'PAY_abc123def456'
            },
            status: {
              type: 'string',
              enum: ['APROVADO', 'CANCELADO', 'REJEITADO'],
              description: 'Status do pagamento',
              example: 'APROVADO'
            },
            motivo: {
              type: 'string',
              description: 'Motivo em caso de cancelamento/rejeição',
              example: 'Cartão sem limite'
            },
            dataProcessamento: {
              type: 'string',
              format: 'date-time',
              description: 'Data e hora do processamento',
              example: '2023-08-17T14:35:00Z'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensagem de erro',
              example: 'Veículo não encontrado'
            },
            details: {
              type: 'string',
              description: 'Detalhes adicionais do erro'
            }
          }
        },
        HealthCheck: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'OK'
            },
            service: {
              type: 'string',
              example: 'Serviço Principal - Gestão de Veículos'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      },
      responses: {
        NotFound: {
          description: 'Recurso não encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        BadRequest: {
          description: 'Dados inválidos na requisição',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        InternalError: {
          description: 'Erro interno do servidor',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    }
  },
  apis: [
    './src/infrastructure/http/routes/*.ts',
    './src/index.ts'
  ]
};

const specs = swaggerJSDoc(options);

export { swaggerUi, specs };
