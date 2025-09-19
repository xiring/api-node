const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { pipeline } = require('stream');
const { promisify } = require('util');
const prisma = require('../config/database');
const { USER_ROLES } = require('../constants');
const { AppError } = require('../errors');

const streamPipeline = promisify(pipeline);

class ReportService {
  constructor() {
    this.outputDir = path.resolve(process.cwd(), 'reports');
  }

  async ensureOutputDir() {
    try {
      await fsp.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      // no-op if exists
    }
  }

  // Escape CSV value
  csvEscape(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  // Generate shipments status CSV report
  async generateShipmentsStatusCSV(requester, params = {}) {
    const { dateFrom, dateTo, status, warehouseIds, vendorIds } = params.filters || {};

    // RBAC: Only ADMIN and MANAGER for now
    if (![USER_ROLES.ADMIN, USER_ROLES.MANAGER].includes(requester.role)) {
      throw new AppError('Insufficient permissions for report export', 403);
    }

    await this.ensureOutputDir();

    const fileName = `shipments_status_${Date.now()}.csv`;
    const filePath = path.join(this.outputDir, fileName);
    const writeStream = fs.createWriteStream(filePath);

    // Write header
    const headers = [
      'trackingNumber',
      'orderNumber',
      'vendorId',
      'warehouse',
      'status',
      'carrier',
      'estimatedDelivery',
      'actualDelivery',
      'deliveryCity',
      'createdAt',
      'updatedAt'
    ];
    writeStream.write(headers.join(',') + '\n');

    // Build where clause
    const where = {};
    if (status && Array.isArray(status) && status.length > 0) {
      where.status = { in: status };
    }
    if (warehouseIds && warehouseIds.length > 0) {
      where.warehouseId = { in: warehouseIds };
    }
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }
    if (vendorIds && vendorIds.length > 0) {
      where.order = { vendorId: { in: vendorIds } };
    }

    // Stream data in pages
    const pageSize = 2000;
    let page = 0;
    let totalRows = 0;

    while (true) {
      const shipments = await prisma.shipment.findMany({
        where,
        include: {
          order: {
            select: {
              orderNumber: true,
              vendorId: true,
              deliveryCity: true
            }
          },
          warehouse: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: page * pageSize,
        take: pageSize
      });

      if (!shipments || shipments.length === 0) break;

      for (const s of shipments) {
        const row = [
          this.csvEscape(s.trackingNumber),
          this.csvEscape(s.order?.orderNumber),
          this.csvEscape(s.order?.vendorId),
          this.csvEscape(s.warehouse?.name),
          this.csvEscape(s.status),
          this.csvEscape(s.carrier || ''),
          this.csvEscape(s.estimatedDelivery ? new Date(s.estimatedDelivery).toISOString() : ''),
          this.csvEscape(s.actualDelivery ? new Date(s.actualDelivery).toISOString() : ''),
          this.csvEscape(s.order?.deliveryCity || ''),
          this.csvEscape(s.createdAt.toISOString()),
          this.csvEscape(s.updatedAt.toISOString())
        ];
        writeStream.write(row.join(',') + '\n');
        totalRows += 1;
      }

      page += 1;
      if (shipments.length < pageSize) break;
    }

    await new Promise((resolve, reject) => {
      writeStream.end(() => resolve());
      writeStream.on('error', reject);
    });

    return { filePath, fileName, rows: totalRows };
  }

  async generateOrdersSummaryCSV(requester, params = {}) {
    const { dateFrom, dateTo, status, vendorIds, cities, deliveryTypes } = params.filters || {};

    await this.ensureOutputDir();
    const fileName = `orders_summary_${Date.now()}.csv`;
    const filePath = path.join(this.outputDir, fileName);
    const ws = fs.createWriteStream(filePath);

    const headers = [
      'orderNumber','vendorId','userId','status','deliveryType','deliveryCity','totalAmount','createdAt','updatedAt'
    ];
    ws.write(headers.join(',') + '\n');

    const where = {};
    if (status && status.length) where.status = { in: status };
    if (vendorIds && vendorIds.length) where.vendorId = { in: vendorIds };
    if (cities && cities.length) where.deliveryCity = { in: cities };
    if (deliveryTypes && deliveryTypes.length) where.deliveryType = { in: deliveryTypes };
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const pageSize = 2000; let page = 0; let totalRows = 0;
    while (true) {
      const orders = await prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: page * pageSize,
        take: pageSize
      });
      if (!orders.length) break;
      for (const o of orders) {
        const row = [
          this.csvEscape(o.orderNumber),
          this.csvEscape(o.vendorId),
          this.csvEscape(o.userId || ''),
          this.csvEscape(o.status),
          this.csvEscape(o.deliveryType),
          this.csvEscape(o.deliveryCity),
          this.csvEscape(o.totalAmount),
          this.csvEscape(o.createdAt.toISOString()),
          this.csvEscape(o.updatedAt.toISOString())
        ];
        ws.write(row.join(',') + '\n');
        totalRows += 1;
      }
      page += 1; if (orders.length < pageSize) break;
    }

    await new Promise((resolve, reject) => { ws.end(resolve); ws.on('error', reject); });
    return { filePath, fileName, rows: totalRows };
  }

  async generateCodReconciliationCSV(requester, params = {}) {
    const { dateFrom, dateTo, vendorIds, status } = params.filters || {};

    await this.ensureOutputDir();
    const fileName = `cod_reconciliation_${Date.now()}.csv`;
    const filePath = path.join(this.outputDir, fileName);
    const ws = fs.createWriteStream(filePath);

    const headers = ['orderNumber','trackingNumber','vendorId','amountToBeCollected','delivered','actualDelivery','notes'];
    ws.write(headers.join(',') + '\n');

    // Use shipments joined to orders to infer COD items
    const whereShipment = {};
    if (dateFrom || dateTo) {
      whereShipment.actualDelivery = {};
      if (dateFrom) whereShipment.actualDelivery.gte = new Date(dateFrom);
      if (dateTo) whereShipment.actualDelivery.lte = new Date(dateTo);
    }
    if (status && status.length) whereShipment.status = { in: status };

    const pageSize = 2000; let page = 0; let totalRows = 0;
    while (true) {
      const shipments = await prisma.shipment.findMany({
        where: whereShipment,
        include: {
          order: {
            select: { orderNumber: true, vendorId: true, amountToBeCollected: true }
          }
        },
        orderBy: { actualDelivery: 'desc' },
        skip: page * pageSize,
        take: pageSize
      });
      if (!shipments.length) break;
      for (const s of shipments) {
        if (vendorIds && vendorIds.length && (!s.order || !vendorIds.includes(s.order.vendorId))) continue;
        const row = [
          this.csvEscape(s.order?.orderNumber || ''),
          this.csvEscape(s.trackingNumber),
          this.csvEscape(s.order?.vendorId || ''),
          this.csvEscape(s.order?.amountToBeCollected ?? ''),
          this.csvEscape(s.status === 'DELIVERED' ? 'YES' : 'NO'),
          this.csvEscape(s.actualDelivery ? s.actualDelivery.toISOString() : ''),
          this.csvEscape(s.notes || '')
        ];
        ws.write(row.join(',') + '\n');
        totalRows += 1;
      }
      page += 1; if (shipments.length < pageSize) break;
    }

    await new Promise((resolve, reject) => { ws.end(resolve); ws.on('error', reject); });
    return { filePath, fileName, rows: totalRows };
  }

  async generateWarehouseUtilizationCSV(requester, params = {}) {
    const { dateFrom, dateTo, warehouseIds } = params.filters || {};
    await this.ensureOutputDir();
    const fileName = `warehouse_utilization_${Date.now()}.csv`;
    const filePath = path.join(this.outputDir, fileName);
    const ws = fs.createWriteStream(filePath);

    const headers = ['warehouse','date','inboundCount','outboundCount'];
    ws.write(headers.join(',') + '\n');

    const whereOrders = {};
    if (dateFrom || dateTo) {
      whereOrders.createdAt = {};
      if (dateFrom) whereOrders.createdAt.gte = new Date(dateFrom);
      if (dateTo) whereOrders.createdAt.lte = new Date(dateTo);
    }

    // For simplicity, approximate inbound as orders created and outbound as shipments created per day
    const pageSize = 2000; let page = 0; let totalRows = 0;
    while (true) {
      const shipments = await prisma.shipment.findMany({
        where: warehouseIds && warehouseIds.length ? { warehouseId: { in: warehouseIds } } : {},
        include: { warehouse: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: page * pageSize,
        take: pageSize
      });
      if (!shipments.length) break;

      // Aggregate per day per warehouse (in-memory for test scale)
      const map = new Map();
      for (const s of shipments) {
        const day = s.createdAt.toISOString().slice(0,10);
        const wh = s.warehouse?.name || 'Unknown';
        const key = `${wh}|${day}`;
        const current = map.get(key) || { inbound: 0, outbound: 0 };
        current.outbound += 1;
        map.set(key, current);
      }

      for (const [key, val] of map.entries()) {
        const [wh, day] = key.split('|');
        const row = [ this.csvEscape(wh), this.csvEscape(day), this.csvEscape(val.inbound), this.csvEscape(val.outbound) ];
        ws.write(row.join(',') + '\n');
        totalRows += 1;
      }

      page += 1; if (shipments.length < pageSize) break;
    }

    await new Promise((resolve, reject) => { ws.end(resolve); ws.on('error', reject); });
    return { filePath, fileName, rows: totalRows };
  }

  async generateUserActivityCSV(requester, params = {}) {
    // Assuming security logs are stored externally; as a placeholder, export users and last updated
    await this.ensureOutputDir();
    const fileName = `user_activity_${Date.now()}.csv`;
    const filePath = path.join(this.outputDir, fileName);
    const ws = fs.createWriteStream(filePath);
    ws.write(['userId','email','role','createdAt','updatedAt'].join(',') + '\n');

    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    let totalRows = 0;
    for (const u of users) {
      const row = [this.csvEscape(u.id), this.csvEscape(u.email), this.csvEscape(u.role), this.csvEscape(u.createdAt.toISOString()), this.csvEscape(u.updatedAt.toISOString())];
      ws.write(row.join(',') + '\n');
      totalRows += 1;
    }
    await new Promise((resolve, reject) => { ws.end(resolve); ws.on('error', reject); });
    return { filePath, fileName, rows: totalRows };
  }
}

module.exports = new ReportService();


