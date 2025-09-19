const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/ReportController');
const { authenticateToken, requireManager, requireAdmin } = require('../middleware/auth');
const { validateExport } = require('../validators/reportValidator');

/**
 * @swagger
 * /reports/export:
 *   post:
 *     summary: Enqueue a CSV report export job
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [SHIPMENTS_STATUS, ORDERS_SUMMARY, COD_RECONCILIATION, WAREHOUSE_UTILIZATION, USER_ACTIVITY]
 *               filters:
 *                 type: object
 *               delivery:
 *                 type: string
 *                 enum: [download, email]
 *     responses:
 *       200:
 *         description: Job enqueued
 */
router.post('/export', authenticateToken, requireManager, validateExport, ReportController.export);

/**
 * @swagger
 * /reports/{jobId}/status:
 *   get:
 *     summary: Get report job status
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job status
 */
router.get('/:jobId/status', authenticateToken, requireManager, ReportController.status);

/**
 * @swagger
 * /reports/{jobId}/download:
 *   get:
 *     summary: Download generated CSV report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: CSV download
 */
router.get('/:jobId/download', authenticateToken, requireManager, ReportController.download);

module.exports = router;


