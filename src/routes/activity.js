const express = require('express');
const router = express.Router();
const ActivityLogController = require('../controllers/ActivityLogController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

/**
 * @swagger
 * /activity/logs:
 *   get:
 *     summary: Get activity logs with filters and pagination
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: method
 *         schema:
 *           type: string
 *           enum: [GET, POST, PUT, PATCH, DELETE]
 *       - in: query
 *         name: statusCode
 *         schema:
 *           type: integer
 *       - in: query
 *         name: path
 *         schema:
 *           type: string
 *       - in: query
 *         name: ip
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: minDurationMs
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxDurationMs
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of activity logs
 */
router.get('/logs', authenticateToken, requireAdmin, ActivityLogController.list);

module.exports = router;


