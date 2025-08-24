import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();
const authController = new AuthController();

/**
 * @swagger
 * components:
 *   schemas:
 *     RegistrarClienteInput:
 *       type: object
 *       required:
 *         - nome
 *         - email
 *         - senha
 *         - cpf
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome completo do cliente
 *           example: "Maria Santos"
 *         email:
 *           type: string
 *           format: email
 *           description: Email do cliente
 *           example: "maria@exemplo.com"
 *         senha:
 *           type: string
 *           minLength: 6
 *           description: Senha do cliente
 *           example: "senha123"
 *         cpf:
 *           type: string
 *           pattern: "^[0-9]{11}$"
 *           description: CPF do cliente
 *           example: "12345678901"
 *         telefone:
 *           type: string
 *           description: Telefone do cliente
 *           example: "(11) 99999-9999"
 *         endereco:
 *           type: string
 *           description: Endereço do cliente
 *           example: "Rua das Flores, 123"
 * 
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - senha
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email do usuário
 *           example: "joao@exemplo.com"
 *         senha:
 *           type: string
 *           description: Senha do usuário
 *           example: "senha123"
 * 
 *     LoginResponse:
 *       type: object
 *       properties:
 *         usuario:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: "usr_1692287654321_abc123"
 *             nome:
 *               type: string
 *               example: "João Silva"
 *             email:
 *               type: string
 *               example: "joao@exemplo.com"
 *             tipo:
 *               type: string
 *               enum: [ADMIN, CLIENTE]
 *               example: "CLIENTE"
 *             ativo:
 *               type: boolean
 *               example: true
 *             cpf:
 *               type: string
 *               example: "12345678901"
 *         token:
 *           type: string
 *           description: Token JWT para autenticação
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         message:
 *           type: string
 *           example: "Login realizado com sucesso"
 */

// Rota /registrar removida - use /registrar-cliente para registros públicos

/**
 * @swagger
 * /api/auth/registrar-cliente:
 *   post:
 *     tags: [Autenticação]
 *     summary: Registrar um novo cliente
 *     description: Endpoint específico para registrar um cliente (usado pelo serviço de vendas)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistrarClienteInput'
 *     responses:
 *       201:
 *         description: Cliente registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *                 message:
 *                   type: string
 *                   example: "Usuário registrado com sucesso"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/registrar-cliente', (req, res) => authController.registrarCliente(req, res));

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Autenticação]
 *     summary: Fazer login no sistema
 *     description: Endpoint para autenticar um usuário e receber um token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/login', (req, res) => authController.login(req, res));

export default router;
