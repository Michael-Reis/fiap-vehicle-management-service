import { Router } from 'express';
import { WebhookController } from '../controllers/WebhookController';

const router = Router();
const webhookController = new WebhookController();

/**
 * @swagger
 * components:
 *   schemas:
 *     WebhookPagamentoInput:
 *       type: object
 *       required:
 *         - codigoPagamento
 *         - status
 *         - veiculoId
 *       properties:
 *         codigoPagamento:
 *           type: string
 *           description: Código único do pagamento
 *           example: "PAG-123456789"
 *         status:
 *           type: string
 *           enum: [aprovado, rejeitado, pendente, cancelado]
 *           description: Status do pagamento
 *           example: "aprovado"
 *         veiculoId:
 *           type: string
 *           description: ID do veículo sendo comprado
 *           example: "1"
 *         cpfComprador:
 *           type: string
 *           description: CPF do comprador (obrigatório para status aprovado)
 *           example: "12345678901"
 *         valorPago:
 *           type: number
 *           format: float
 *           description: Valor pago pelo veículo (obrigatório para status aprovado, deve ser igual ao preço do veículo)
 *           example: 85000.00
 *         metodoPagamento:
 *           type: string
 *           description: Método de pagamento utilizado
 *           example: "cartao_credito"
 *         dataTransacao:
 *           type: string
 *           format: date-time
 *           description: Data e hora da transação
 *           example: "2023-08-17T14:30:00Z"
 *     
 *     WebhookPagamentoOutput:
 *       type: object
 *       properties:
 *         sucesso:
 *           type: boolean
 *           description: Se o webhook foi processado com sucesso
 *         mensagem:
 *           type: string
 *           description: Mensagem descritiva do resultado
 *         veiculoId:
 *           type: string
 *           description: ID do veículo processado
 *         novoStatus:
 *           type: string
 *           enum: [A_VENDA, VENDIDO, RESERVADO]
 *           description: Novo status do veículo
 *         dataVenda:
 *           type: string
 *           format: date-time
 *           description: Data da venda (apenas para status aprovado)
 */

/**
 * @swagger
 * /api/webhook/pagamento:
 *   post:
 *     tags: [Webhooks]
 *     summary: Processar webhook de pagamento
 *     description: Endpoint para receber notificações de status de pagamento de provedores externos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WebhookPagamentoInput'
 *           examples:
 *             pagamento_aprovado:
 *               summary: Pagamento Aprovado
 *               value:
 *                 codigoPagamento: "PAG-123456789"
 *                 status: "aprovado"
 *                 veiculoId: "1"
 *                 cpfComprador: "12345678901"
 *                 valorPago: 85000.00
 *                 metodoPagamento: "cartao_credito"
 *                 dataTransacao: "2023-08-17T14:30:00Z"
 *             pagamento_rejeitado:
 *               summary: Pagamento Rejeitado
 *               value:
 *                 codigoPagamento: "PAG-123456789"
 *                 status: "rejeitado"
 *                 veiculoId: "1"
 *             pagamento_pendente:
 *               summary: Pagamento Pendente
 *               value:
 *                 codigoPagamento: "PAG-123456789"
 *                 status: "pendente"
 *                 veiculoId: "1"
 *     responses:
 *       200:
 *         description: Webhook processado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WebhookPagamentoOutput'
 *       400:
 *         description: Dados inválidos ou veículo já vendido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "CPF do comprador é obrigatório para pagamentos aprovados"
 *                 success:
 *                   type: boolean
 *                   example: false
 *       404:
 *         description: Veículo não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/pagamento', (req, res) => webhookController.processarPagamento(req, res));

/**
 * @swagger
 * /api/webhook/status/{veiculoId}:
 *   get:
 *     tags: [Webhooks]
 *     summary: Consultar status de pagamento
 *     description: Consulta o status atual de pagamento de um veículo
 *     parameters:
 *       - in: path
 *         name: veiculoId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do veículo
 *         example: "1"
 *     responses:
 *       200:
 *         description: Status consultado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 veiculoId:
 *                   type: string
 *                 note:
 *                   type: string
 *       400:
 *         description: ID do veículo é obrigatório
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/status/:veiculoId', (req, res) => webhookController.obterStatusPagamento(req, res));

export default router;
