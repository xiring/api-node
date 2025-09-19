const BaseRepository = require('./BaseRepository');
const { DatabaseError } = require('../errors');
const prisma = require('../config/database');

class FareRepository extends BaseRepository {
  constructor() {
    super(prisma.fare);
  }

  async findManyWithPagination(where = {}, options = {}) {
    try {
      const { page = 1, limit = 10, fromCity, toCity, isActive } = options;
      const skip = (page - 1) * limit;

      const searchWhere = { ...where };
      if (fromCity) searchWhere.fromCity = { contains: fromCity, mode: 'insensitive' };
      if (toCity) searchWhere.toCity = { contains: toCity, mode: 'insensitive' };
      if (isActive !== undefined) searchWhere.isActive = isActive === 'true' || isActive === true;

      const [fares, total] = await Promise.all([
        this.findMany(searchWhere, { 
          skip, 
          take: limit, 
          orderBy: { createdAt: 'desc' } 
        }),
        this.count(searchWhere)
      ]);

      return {
        fares,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new DatabaseError(`Failed to find fares with pagination: ${error.message}`);
    }
  }

  async findByRoute(fromCity, toCity) {
    try {
      return await this.model.findFirst({
        where: {
          fromCity: { contains: fromCity, mode: 'insensitive' },
          toCity: { contains: toCity, mode: 'insensitive' },
          isActive: true
        }
      });
    } catch (error) {
      throw new DatabaseError(`Failed to find fare by route: ${error.message}`);
    }
  }

  async findUniqueRoute(fromCity, toCity) {
    try {
      return await this.model.findUnique({
        where: {
          fromCity_toCity: {
            fromCity,
            toCity
          }
        }
      });
    } catch (error) {
      throw new DatabaseError(`Failed to find unique fare route: ${error.message}`);
    }
  }
}

module.exports = FareRepository;
