const prisma = require('../config/database');
const { USER_ROLES } = require('../constants');
const { AppError } = require('../errors');

class DashboardService {
  constructor() {}

  enforceAuthenticated(user) {
    if (!user || !user.role) {
      throw new AppError('Insufficient permissions', 403);
    }
  }

  parseRange(range) {
    const now = new Date();
    const ranges = { '7d': 7, '14d': 14, '30d': 30, '90d': 90 };
    const days = ranges[range] || 30;
    const from = new Date(now);
    from.setDate(now.getDate() - (days - 1));
    from.setHours(0, 0, 0, 0);
    const to = new Date(now);
    return { from, to, days };
  }

  buildEmptySeries(from, to) {
    const series = {};
    const cursor = new Date(from);
    while (cursor <= to) {
      const key = cursor.toISOString().slice(0, 10);
      series[key] = 0;
      cursor.setDate(cursor.getDate() + 1);
    }
    return series;
  }

  async getSummary(user, range = '30d') {
    this.enforceAuthenticated(user);
    const { from, to } = this.parseRange(range);

    // Scope for vendor role
    const vendorScope = user.role === USER_ROLES.USER ? { vendorId: user.vendorId || undefined } : {};
    const orderWhereScope = vendorScope.vendorId ? { vendorId: vendorScope.vendorId } : {};
    const shipmentWhereScope = vendorScope.vendorId ? { order: { vendorId: vendorScope.vendorId } } : {};

    // Counts (scoped for vendor)
    const [ordersTotal, shipmentsTotal, vendorsTotal, warehousesTotal] = await Promise.all([
      prisma.order.count({ where: orderWhereScope }),
      prisma.shipment.count({ where: shipmentWhereScope }),
      prisma.vendor.count(),
      prisma.warehouse.count()
    ]);

    // Status distributions
    const [orders, shipments] = await Promise.all([
      prisma.order.findMany({ where: { ...orderWhereScope, createdAt: { gte: from, lte: to } }, select: { status: true } }),
      prisma.shipment.findMany({ where: { ...shipmentWhereScope, createdAt: { gte: from, lte: to } }, select: { status: true } })
    ]);

    const ordersByStatus = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {});
    const shipmentsByStatus = shipments.reduce((acc, s) => { acc[s.status] = (acc[s.status] || 0) + 1; return acc; }, {});

    // Trends
    const ordersSeries = this.buildEmptySeries(from, to);
    const shipmentsSeries = this.buildEmptySeries(from, to);
    const deliveredSeries = this.buildEmptySeries(from, to);

    const [ordersInRange, shipmentsInRange] = await Promise.all([
      prisma.order.findMany({ where: { ...orderWhereScope, createdAt: { gte: from, lte: to } }, select: { createdAt: true, totalAmount: true } }),
      prisma.shipment.findMany({ where: { ...shipmentWhereScope, createdAt: { gte: from, lte: to } }, select: { createdAt: true, status: true, actualDelivery: true } })
    ]);

    let revenueTotal = 0;
    for (const o of ordersInRange) {
      const key = o.createdAt.toISOString().slice(0, 10);
      ordersSeries[key] = (ordersSeries[key] || 0) + 1;
      revenueTotal += Number(o.totalAmount || 0);
    }
    for (const s of shipmentsInRange) {
      const key = s.createdAt.toISOString().slice(0, 10);
      shipmentsSeries[key] = (shipmentsSeries[key] || 0) + 1;
      if (s.status === 'DELIVERED' && s.actualDelivery) {
        const dkey = s.actualDelivery.toISOString().slice(0, 10);
        deliveredSeries[dkey] = (deliveredSeries[dkey] || 0) + 1;
      }
    }

    // Top cities
    const topCitiesAgg = await prisma.order.findMany({
      where: { ...orderWhereScope, createdAt: { gte: from, lte: to } },
      select: { deliveryCity: true }
    });
    const cityMap = topCitiesAgg.reduce((acc, o) => { const c = o.deliveryCity || 'Unknown'; acc[c] = (acc[c] || 0) + 1; return acc; }, {});
    const topCities = Object.entries(cityMap)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totals: { ordersTotal, shipmentsTotal, vendorsTotal, warehousesTotal, revenueTotal },
      ordersByStatus,
      shipmentsByStatus,
      trends: {
        ordersCreatedPerDay: ordersSeries,
        shipmentsCreatedPerDay: shipmentsSeries,
        shipmentsDeliveredPerDay: deliveredSeries
      },
      topCities
    };
  }

  async getTrends(user, metric = 'orders', range = '30d') {
    this.enforceAuthenticated(user);
    const { from, to } = this.parseRange(range);
    const series = this.buildEmptySeries(from, to);

    if (metric === 'orders') {
      const rows = await prisma.order.findMany({ where: { createdAt: { gte: from, lte: to } }, select: { createdAt: true } });
      for (const r of rows) {
        const key = r.createdAt.toISOString().slice(0, 10);
        series[key] = (series[key] || 0) + 1;
      }
    } else if (metric === 'shipments') {
      const rows = await prisma.shipment.findMany({ where: { createdAt: { gte: from, lte: to } }, select: { createdAt: true } });
      for (const r of rows) {
        const key = r.createdAt.toISOString().slice(0, 10);
        series[key] = (series[key] || 0) + 1;
      }
    } else if (metric === 'delivered') {
      const rows = await prisma.shipment.findMany({ where: { actualDelivery: { not: null, gte: from, lte: to }, status: 'DELIVERED' }, select: { actualDelivery: true } });
      for (const r of rows) {
        const key = r.actualDelivery.toISOString().slice(0, 10);
        series[key] = (series[key] || 0) + 1;
      }
    } else {
      throw new AppError('Invalid metric', 400);
    }

    return { metric, range, series };
  }
}

module.exports = new DashboardService();


