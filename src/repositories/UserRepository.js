const BaseRepository = require('./BaseRepository');
const prisma = require('../config/database');

class UserRepository extends BaseRepository {
  constructor() {
    super(prisma.user);
  }

  async findByEmail(email) {
    try {
      return await this.model.findUnique({
        where: { email }
      });
    } catch (error) {
      throw new DatabaseError(`Failed to find user by email: ${error.message}`);
    }
  }

  async findManyWithPagination(where = {}, options = {}) {
    try {
      const { page = 1, limit = 10, search, role, isActive } = options;
      const skip = (page - 1) * limit;

      const searchWhere = { ...where };
      if (search) {
        searchWhere.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ];
      }
      if (role) {
        searchWhere.role = role;
      }

      const [users, total] = await Promise.all([
        this.findMany(searchWhere, { skip, take: limit, orderBy: { createdAt: 'desc' } }),
        this.count(searchWhere)
      ]);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new DatabaseError(`Failed to find users with pagination: ${error.message}`);
    }
  }
}

module.exports = UserRepository;
