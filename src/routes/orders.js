const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');
const { authenticateToken, requireManager, requireAdmin } = require('../middleware/auth');
const { idempotency } = require('../middleware/idempotency');
const { validateCreateOrder, validateUpdateOrder, validateOrderQuery } = require('../validators/orderValidator');

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, RETURNED]
 *         description: Filter by order status
 *       - in: query
 *         name: vendorId
 *         schema:
 *           type: string
 *         description: Filter by vendor ID
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by assigned user ID
 *       - in: query
 *         name: deliveryCity
 *         schema:
 *           type: string
 *         description: Filter by delivery city
 *       - in: query
 *         name: deliveryType
 *         schema:
 *           type: string
 *           enum: [BRANCH_DELIVERY, COD_BRANCH, DOOR_DELIVERY]
 *         description: Filter by delivery type
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', authenticateToken, validateOrderQuery, OrderController.getAllOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', authenticateToken, OrderController.getOrderById);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vendorId
 *               - deliveryCity
 *               - deliveryAddress
 *               - contactNumber
 *               - name
 *               - deliveryType
 *               - productWeight
 *               - productType
 *             properties:
 *               vendorId:
 *                 type: string
 *                 example: "vendor123"
 *               userId:
 *                 type: string
 *                 example: "user123"
 *               deliveryCity:
 *                 type: string
 *                 example: "Kathmandu"
 *               deliveryAddress:
 *                 type: string
 *                 example: "Thamel, Kathmandu 44600"
 *               contactNumber:
 *                 type: string
 *                 example: "+977-98-1234567"
 *               name:
 *                 type: string
 *                 example: "Ram Shrestha"
 *               alternateContactNumber:
 *                 type: string
 *                 example: "+977-98-7654321"
 *               amountToBeCollected:
 *                 type: number
 *                 format: float
 *                 example: 5000.00
 *               deliveryType:
 *                 type: string
 *                 enum: [BRANCH_DELIVERY, COD_BRANCH, DOOR_DELIVERY]
 *                 example: "DOOR_DELIVERY"
 *               productWeight:
 *                 type: number
 *                 format: float
 *                 example: 2.5
 *               productType:
 *                 type: string
 *                 example: "Electronics"
 *               notes:
 *                 type: string
 *                 example: "Handle with care"
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *       400:
 *         description: Validation error or fare not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', authenticateToken, idempotency(), validateCreateOrder, OrderController.createOrder);

/**
 * @swagger
 * /orders/{id}:
 *   put:
 *     summary: Update order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, RETURNED]
 *               deliveryCity:
 *                 type: string
 *               deliveryAddress:
 *                 type: string
 *               contactNumber:
 *                 type: string
 *               name:
 *                 type: string
 *               alternateContactNumber:
 *                 type: string
 *               amountToBeCollected:
 *                 type: number
 *                 format: float
 *               deliveryType:
 *                 type: string
 *                 enum: [BRANCH_DELIVERY, COD_BRANCH, DOOR_DELIVERY]
 *               productWeight:
 *                 type: number
 *                 format: float
 *               productType:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', authenticateToken, requireManager, validateUpdateOrder, OrderController.updateOrder);

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Delete order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authenticateToken, requireAdmin, OrderController.deleteOrder);

module.exports = router;