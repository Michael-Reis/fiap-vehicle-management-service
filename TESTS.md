# Documentação dos Testes

Este documento descreve todos os testes criados para o projeto de gestão de veículos.

## Estrutura dos Testes

```
src/__tests__/
├── setup.ts                                    # Configuração global dos testes
├── application/
│   └── usecases/
│       ├── CadastrarVeiculoUseCase.test.ts     # Testes do caso de uso de cadastro
│       └── LoginUseCase.test.ts                # Testes do caso de uso de login
├── business/
│   └── business-logic.test.ts                  # Testes de lógica de negócio
├── domain/
│   ├── entities/
│   │   ├── Usuario.test.ts                     # Testes da entidade Usuario
│   │   └── Veiculo.test.ts                     # Testes da entidade Veiculo
│   └── services/
│       └── ExternalServices.test.ts            # Testes de serviços externos
├── infrastructure/
│   ├── http/
│   │   ├── controllers/
│   │   │   └── VeiculoController.test.ts       # Testes do controller
│   │   └── middlewares/
│   │       └── authMiddleware.test.ts          # Testes do middleware de auth
│   └── repositories/
│       └── VeiculoRepositoryImpl.test.ts       # Testes do repositório
├── integration/
│   └── api.test.ts                             # Testes de integração da API
├── performance/
│   └── performance.test.ts                     # Testes de performance
└── utils/
    └── validations.test.ts                     # Testes de validações e utilitários
```

## Categorias de Testes

### 1. Testes de Entidades (Domain)

#### Usuario.test.ts
- **Criação de usuário**: Valida a criação com dados válidos e geração de IDs
- **Validações**: Testa validações de nome, email, senha, CPF e telefone
- **Métodos utilitários**: Testa `ehAdmin()`, `ehCliente()`, `podeGerenciarVeiculos()`
- **Serialização**: Testa `toJSON()` e `toSafeJSON()`

#### Veiculo.test.ts
- **Criação de veículo**: Valida criação com propriedades básicas e dados de venda
- **Validações**: Testa validações de marca, modelo, ano, preço e cor
- **Operações de venda**: Testa `marcarComoVendido()`, `marcarComoReservado()`, `cancelarReserva()`
- **Métodos utilitários**: Testa disponibilidade, status de venda e reserva
- **Atualização**: Testa atualização de preço e cor

### 2. Testes de Casos de Uso (Application)

#### CadastrarVeiculoUseCase.test.ts
- **Execução bem-sucedida**: Testa cadastro com dados válidos
- **Limpeza de dados**: Verifica remoção de espaços em branco
- **Tratamento de erros**: Testa falhas do repositório e validações

#### LoginUseCase.test.ts
- **Login bem-sucedido**: Testa autenticação com credenciais válidas
- **Falhas de autenticação**: Testa usuário inexistente, inativo e senha incorreta
- **Geração de token**: Testa criação de JWT com payload correto
- **Tratamento de erros**: Testa erros do repositório e bcrypt

### 3. Testes de Infraestrutura

#### VeiculoController.test.ts
- **Endpoints**: Testa POST, GET, PUT para veículos
- **Respostas**: Valida estrutura de resposta e códigos HTTP
- **Tratamento de erros**: Testa 400, 404 e 500

#### authMiddleware.test.ts
- **Token válido**: Testa acesso com token JWT válido
- **Falhas de autenticação**: Testa token ausente, inválido, expirado
- **Configuração**: Testa diferentes configurações de JWT_SECRET

#### VeiculoRepositoryImpl.test.ts
- **Operações CRUD**: Testa salvar, buscar, atualizar, deletar
- **Queries específicas**: Testa busca por status e veículos disponíveis
- **Mapeamento**: Testa conversão entre banco e entidade
- **Tratamento de erros**: Testa falhas de conexão e SQL

### 4. Testes de Serviços

#### ExternalServices.test.ts
- **Validação de CPF**: Testa integração com serviço externo
- **Processamento de pagamento**: Testa gateway de pagamento
- **Notificações**: Testa envio de email e SMS
- **CEP**: Testa consulta de endereço
- **Configurações**: Testa timeout e retry logic

### 5. Testes de Validações e Utilitários

#### validations.test.ts
- **CPF**: Validação de CPFs válidos e inválidos
- **Email**: Validação de formato de email
- **Senha**: Validação de critérios de segurança
- **Data**: Formatação e manipulação de datas
- **Moeda**: Formatação de valores monetários
- **String**: Operações com texto (acentos, capitalização)
- **Array**: Operações com listas (duplicados, agrupamento)

### 6. Testes de Lógica de Negócio

#### business-logic.test.ts
- **Gestão de status de veículo**: Disponibilidade, vendas, cálculos
- **Gerenciamento de usuários**: Roles, permissões
- **Cálculos financeiros**: Descontos, parcelas, impostos
- **Busca e filtros**: Critérios múltiplos, ordenação
- **Utilitários de data**: Dias úteis, idades, prazos

### 7. Testes de Performance

#### performance.test.ts
- **Criação de entidades**: Performance com grandes volumes
- **Processamento de listas**: Filtros e ordenação eficientes
- **Simulação de banco**: Consultas e inserções concorrentes
- **Operações de string**: Formatação intensiva
- **Gestão de memória**: Objetos grandes sem vazamentos
- **Carga de API**: Múltiplas requisições simultâneas
- **Benchmarks**: Comparação de algoritmos

### 8. Testes de Integração

#### api.test.ts
- **Health check**: Status da aplicação
- **CORS**: Configuração de headers
- **Segurança**: Headers do Helmet
- **Parsing**: JSON e URL-encoded
- **Tratamento de erros**: Middleware global
- **404**: Rotas não encontradas

## Configuração dos Testes

### setup.ts
- Configuração de variáveis de ambiente para testes
- Mock do console para reduzir logs
- Timeout padrão para testes assíncronos
- Teste dummy para evitar erro do Jest

### jest.config.js
- Configuração do TypeScript com ts-jest
- Padrões de busca de arquivos de teste
- Cobertura de código com thresholds
- Configuração de setup files

## Comandos para Executar Testes

```bash
# Todos os testes
npm test

# Testes específicos por padrão
npm test -- --testPathPattern="business-logic"
npm test -- --testPathPattern="validations"
npm test -- --testPathPattern="performance"

# Testes com cobertura
npm run test:coverage

# Testes em modo watch
npm run test:watch
```

## Métricas de Cobertura

O projeto está configurado para atingir os seguintes thresholds de cobertura:
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## Mocks e Stubs

### Externos
- **axios**: Para requisições HTTP
- **bcrypt**: Para hash de senhas
- **jsonwebtoken**: Para tokens JWT
- **mysql2**: Para conexão com banco

### Internos
- **DatabaseConnection**: Mock da conexão com banco
- **Repositories**: Mock das implementações de repositório
- **Use Cases**: Mock dos casos de uso

## Boas Práticas Implementadas

1. **Isolamento**: Cada teste é independente
2. **Cleanup**: `beforeEach` e `afterEach` para limpeza
3. **Mocks**: Uso adequado de mocks para dependências
4. **Assertions**: Assertions específicas e descritivas
5. **Cobertura**: Testes abrangentes de cenários positivos e negativos
6. **Performance**: Testes de carga e benchmarks
7. **Documentação**: Descrições claras dos cenários testados

## Status dos Testes

### ✅ Funcionando
- Setup
- Business Logic
- Validations
- Performance
- Utilities

### ⚠️ Dependem de Implementação
- Entity tests (Usuario, Veiculo)
- Use Case tests
- Controller tests
- Repository tests
- Middleware tests
- External Services tests

### 🔧 Necessitam Ajustes
- Integration tests (configuração de rotas)
- Database connection mocks

## Próximos Passos

1. Implementar as entidades e casos de uso
2. Ajustar imports nos testes dependentes
3. Configurar banco de dados de teste
4. Implementar fixtures e factories para dados de teste
5. Adicionar testes E2E
6. Configurar CI/CD com execução automática dos testes
