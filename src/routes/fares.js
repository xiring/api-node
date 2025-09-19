const express = require('express');
const router = express.Router();
const FareController = require('../controllers/FareController');
const { authenticateToken, requireManager, requireAdmin } = require('../middleware/auth');
const { validateCreateFare, validateUpdateFare, validateFareQuery } = require('../validators/fareValidator');

/**
 * @swagger
 * /fares:
 *   get:
 *     summary: Get all fares
 *     tags: [Fares]
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
 *         name: fromCity
 *         schema:
 *           type: string
 *         description: Filter by from city
 *       - in: query
 *         name: toCity
 *         schema:
 *           type: string
 *         description: Filter by to city
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of fares
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
 *                     $ref: '#/components/schemas/Fare'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', authenticateToken, validateFareQuery, FareController.getAllFares);

/**
 * @swagger
 * /fares/{id}:
 *   get:
 *     summary: Get fare by ID
 *     tags: [Fares]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Fare ID
 *     responses:
 *       200:
 *         description: Fare details
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
 *                     fare:
 *                       $ref: '#/components/schemas/Fare'
 *       404:
 *         description: Fare not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', authenticateToken, FareController.getFareById);

/**
 * @swagger
 * /fares:
 *   post:
 *     summary: Create new fare
 *     tags: [Fares]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromCity
 *               - toCity
 *               - branchDelivery
 *               - codBranch
 *               - doorDelivery
 *             properties:
 *               fromCity:
 *                 type: string
 *                 example: "Pokhara"
 *               toCity:
 *                 type: string
 *                 example: "Kathmandu"
 *               branchDelivery:
 *                 type: number
 *                 format: float
 *                 example: 500.00
 *               codBranch:
 *                 type: number
 *                 format: float
 *                 example: 750.00
 *               doorDelivery:
 *                 type: number
 *                 format: float
 *                 example: 1000.00
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Fare created successfully
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
 *                     fare:
 *                       $ref: '#/components/schemas/Fare'
 *       400:
 *         description: Validation error or fare route already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', authenticateToken, requireManager, validateCreateFare, FareController.createFare);

/**
 * @swagger
 * /fares/{id}:
 *   put:
 *     summary: Update fare
 *     tags: [Fares]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Fare ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fromCity:
 *                 type: string
 *               toCity:
 *                 type: string
 *               branchDelivery:
 *                 type: number
 *                 format: float
 *               codBranch:
 *                 type: number
 *                 format: float
 *               doorDelivery:
 *                 type: number
 *                 format: float
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Fare updated successfully
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
 *                     fare:
 *                       $ref: '#/components/schemas/Fare'
 *       404:
 *         description: Fare not found
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
router.put('/:id', authenticateToken, requireManager, validateUpdateFare, FareController.updateFare);

/**
 * @swagger
 * /fares/{id}:
 *   delete:
 *     summary: Delete fare
 *     tags: [Fares]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Fare ID
 *     responses:
 *       200:
 *         description: Fare deleted successfully
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
 *         description: Fare not found
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
router.delete('/:id', authenticateToken, requireAdmin, FareController.deleteFare);

/**
 * @swagger
 * /fares/route/{fromCity}/{toCity}:
 *   get:
 *     summary: Get fare by route
 *     tags: [Fares]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fromCity
 *         required: true
 *         schema:
 *           type: string
 *         description: From city
 *       - in: path
 *         name: toCity
 *         required: true
 *         schema:
 *           type: string
 *         description: To city
 *     responses:
 *       200:
 *         description: Fare for the route
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
 *                     fare:
 *                       $ref: '#/components/schemas/Fare'
 *       404:
 *         description: Fare not found for this route
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/route/:fromCity/:toCity', authenticateToken, FareController.getFareByRoute);

module.exports = router;