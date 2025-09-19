const prisma = require('../config/database');

class ActivityLogService {
  static async createActivityLog(payload) {
    const safePayload = ActivityLogService._sanitizePayload(payload);
    try {
      await prisma.activityLog.create({
        data: safePayload
      });
    } catch (_) {
      // Do not throw from logger service
    }
  }

  static async getActivityLogs(options = {}) {
    const {
      page = 1,
      limit = 50,
      userId,
      method,
      statusCode,
      path,
      startDate,
      endDate,
      minDurationMs,
      maxDurationMs,
      ip
    } = options;

    const where = {};
    if (userId) where.userId = userId;
    if (method) where.method = method.toUpperCase();
    if (statusCode) where.statusCode = parseInt(statusCode);
    if (path) where.path = { contains: path, mode: 'insensitive' };
    if (ip) where.ip = { contains: ip, mode: 'insensitive' };
    if (minDurationMs || maxDurationMs) {
      where.durationMs = {};
      if (minDurationMs) where.durationMs.gte = parseInt(minDurationMs);
      if (maxDurationMs) where.durationMs.lte = parseInt(maxDurationMs);
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [total, logs] = await Promise.all([
      prisma.activityLog.count({ where }),
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      })
    ]);

    return {
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    };
  }

  static _sanitizePayload(payload) {
    if (!payload || typeof payload !== 'object') return {};

    const {
      user,
      method,
      path,
      route,
      statusCode,
      durationMs,
      ip,
      userAgent,
      referer,
      query,
      params,
      body
    } = payload;

    const userId = user?.id || null;
    const userEmail = user?.email || null;

    return {
      userId,
      userEmail,
      method,
      path,
      route: route || null,
      statusCode: Number.isFinite(statusCode) ? statusCode : 0,
      durationMs: Number.isFinite(durationMs) ? durationMs : 0,
      ip: ip || null,
      userAgent: userAgent || null,
      referer: referer || null,
      query: query || undefined,
      params: params || undefined,
      body: body || undefined
    };
  }
}

module.exports = ActivityLogService;


