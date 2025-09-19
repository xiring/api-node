const BaseRepository = require('./BaseRepository');
const prisma = require('../config/database');

class WarehouseRepository extends BaseRepository {
  constructor() {
    super(prisma.warehouse);
  }

  async findManyWithPagination(where = {}, options = {}) {
    try {
      const { page = 1, limit = 10, search, city, isActive } = options;
      const skip = (page - 1) * limit;

      const searchWhere = { ...where };
      if (search) {
        searchWhere.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { state: { contains: search, mode: 'insensitive' } }
        ];
      }
      if (city) {
        searchWhere.city = { contains: city, mode: 'insensitive' };
      }
      if (isActive !== undefined) {
        searchWhere.isActive = isActive;
      }

      const [warehouses, total] = await Promise.all([
        this.findMany(searchWhere, { 
          skip, 
          take: limit, 
          orderBy: { createdAt: 'desc' } 
        }),
        this.count(searchWhere)
      ]);

      return {
        warehouses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new DatabaseError(`Failed to find warehouses with pagination: ${error.message}`);
    }
  }

  async findByCity(city) {
    try {
      return await this.model.findMany({
        where: {
          city: { contains: city, mode: 'insensitive' },
          isActive: true
        }
      });
    } catch (error) {
      throw new DatabaseError(`Failed to find warehouses by city: ${error.message}`);
    }
  }
}

module.exports = WarehouseRepository;
