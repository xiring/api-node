const BaseRepository = require('./BaseRepository');
const prisma = require('../config/database');

class VendorRepository extends BaseRepository {
  constructor() {
    super(prisma.vendor);
  }

  async findManyWithPagination(where = {}, options = {}) {
    try {
      const { page = 1, limit = 10, search, city, isActive } = options;
      const skip = (page - 1) * limit;

      const searchWhere = { ...where };
      if (search) {
        searchWhere.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } }
        ];
      }
      if (city) {
        searchWhere.city = { contains: city, mode: 'insensitive' };
      }
      if (isActive !== undefined) {
        searchWhere.isActive = isActive;
      }

      const [vendors, total] = await Promise.all([
        this.findMany(searchWhere, { 
          skip, 
          take: limit, 
          orderBy: { createdAt: 'desc' } 
        }),
        this.count(searchWhere)
      ]);

      return {
        vendors,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new DatabaseError(`Failed to find vendors with pagination: ${error.message}`);
    }
  }

  async findByEmail(email) {
    try {
      return await this.model.findUnique({
        where: { email }
      });
    } catch (error) {
      throw new DatabaseError(`Failed to find vendor by email: ${error.message}`);
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
      throw new DatabaseError(`Failed to find vendors by city: ${error.message}`);
    }
  }
}

module.exports = VendorRepository;
