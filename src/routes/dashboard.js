const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/DashboardController');
const { authenticateToken, requireUser } = require('../middleware/auth');
const { validateSummary, validateTrends } = require('../validators/dashboardValidator');

/**
 * @swagger
 * /dashboard/summary:
 *   get:
 *     summary: Get dashboard summary metrics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: range
 *         schema:
 *           type: string
 *           enum: ["7d","14d","30d","90d"]
 *         description: Date range window
 *     responses:
 *       200:
 *         description: Summary data
 */
router.get('/summary', authenticateToken, requireUser, validateSummary, DashboardController.summary);

/**
 * @swagger
 * /dashboard/trends:
 *   get:
 *     summary: Get dashboard trend series
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: range
 *         schema:
 *           type: string
 *           enum: ["7d","14d","30d","90d"]
 *       - in: query
 *         name: metric
 *         schema:
 *           type: string
 *           enum: ["orders","shipments","delivered"]
 *     responses:
 *       200:
 *         description: Trend series data
 */
router.get('/trends', authenticateToken, requireUser, validateTrends, DashboardController.trends);

module.exports = router;


