const { NotFoundError, ConflictError, BusinessLogicError } = require('../errors');

class BaseService {
  constructor(repository) {
    this.repository = repository;
  }

  async create(data) {
    return await this.repository.create(data);
  }

  async findById(id) {
    const result = await this.repository.findById(id);
    if (!result) {
      throw new NotFoundError(`${this.constructor.name} not found`);
    }
    return result;
  }

  async findMany(where = {}, options = {}) {
    return await this.repository.findMany(where, options);
  }

  async update(id, data) {
    await this.findById(id); // Check if exists
    return await this.repository.update(id, data);
  }

  async delete(id) {
    await this.findById(id); // Check if exists
    return await this.repository.delete(id);
  }

  async exists(id) {
    const result = await this.repository.findById(id);
    return !!result;
  }
}

module.exports = BaseService;
