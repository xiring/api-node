const BaseRepository = require('./BaseRepository');
const prisma = require('../config/database');

class OrderRepository extends BaseRepository {
  constructor() {
    super(prisma.order);
  }

  async findManyWithPagination(where = {}, options = {}) {
    try {
      const { page = 1, limit = 10, status, vendorId, userId, deliveryCity, deliveryType } = options;
      const skip = (page - 1) * limit;

      const searchWhere = { ...where };
      if (status) searchWhere.status = status;
      if (vendorId) searchWhere.vendorId = vendorId;
      if (userId) searchWhere.userId = userId;
      if (deliveryCity) searchWhere.deliveryCity = { contains: deliveryCity, mode: 'insensitive' };
      if (deliveryType) searchWhere.deliveryType = deliveryType;

      const include = {
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
        },
        fare: {
          select: {
            id: true,
            fromCity: true,
            toCity: true,
            branchDelivery: true,
            codBranch: true,
            doorDelivery: true
          }
        },
        shipments: {
          select: {
            id: true,
            trackingNumber: true,
            status: true
          }
        }
      };

      const [orders, total] = await Promise.all([
        this.findMany(searchWhere, { 
          skip, 
          take: limit, 
          orderBy: { createdAt: 'desc' },
          include 
        }),
        this.count(searchWhere)
      ]);

      return {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new DatabaseError(`Failed to find orders with pagination: ${error.message}`);
    }
  }

  async findByIdWithRelations(id) {
    try {
      return await this.model.findUnique({
        where: { id },
        include: {
          vendor: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          fare: true,
          shipments: {
            include: {
              warehouse: {
                select: {
                  id: true,
                  name: true,
                  city: true
                }
              }
            }
          }
        }
      });
    } catch (error) {
      throw new DatabaseError(`Failed to find order with relations: ${error.message}`);
    }
  }

  async findByOrderNumber(orderNumber) {
    try {
      return await this.model.findUnique({
        where: { orderNumber }
      });
    } catch (error) {
      throw new DatabaseError(`Failed to find order by number: ${error.message}`);
    }
  }
}

module.exports = OrderRepository;
