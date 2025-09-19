const BaseRepository = require('./BaseRepository');
const prisma = require('../config/database');

class ShipmentRepository extends BaseRepository {
  constructor() {
    super(prisma.shipment);
  }

  async findManyWithPagination(where = {}, options = {}) {
    try {
      const { page = 1, limit = 10, status, orderId, warehouseId } = options;
      const skip = (page - 1) * limit;

      const searchWhere = { ...where };
      if (status) searchWhere.status = status;
      if (orderId) searchWhere.orderId = orderId;
      if (warehouseId) searchWhere.warehouseId = warehouseId;

      const include = {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            deliveryCity: true,
            deliveryAddress: true
          }
        },
        warehouse: {
          select: {
            id: true,
            name: true,
            city: true
          }
        }
      };

      const [shipments, total] = await Promise.all([
        this.findMany(searchWhere, { 
          skip, 
          take: limit, 
          orderBy: { createdAt: 'desc' },
          include 
        }),
        this.count(searchWhere)
      ]);

      return {
        shipments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new DatabaseError(`Failed to find shipments with pagination: ${error.message}`);
    }
  }

  async findByIdWithRelations(id) {
    try {
      return await this.model.findUnique({
        where: { id },
        include: {
          order: {
            include: {
              vendor: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              },
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          warehouse: true
        }
      });
    } catch (error) {
      throw new DatabaseError(`Failed to find shipment with relations: ${error.message}`);
    }
  }

  async findByTrackingNumber(trackingNumber) {
    try {
      return await this.model.findUnique({
        where: { trackingNumber },
        include: {
          order: {
            include: {
              vendor: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          warehouse: true
        }
      });
    } catch (error) {
      throw new DatabaseError(`Failed to find shipment by tracking number: ${error.message}`);
    }
  }
}

module.exports = ShipmentRepository;
