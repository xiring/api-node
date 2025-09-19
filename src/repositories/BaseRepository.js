const { DatabaseError, NotFoundError } = require('../errors');

class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    try {
      return await this.model.create({ data });
    } catch (error) {
      throw new DatabaseError(`Failed to create ${this.model.name}: ${error.message}`);
    }
  }

  async findById(id, include = {}) {
    try {
      return await this.model.findUnique({
        where: { id },
        include
      });
    } catch (error) {
      throw new DatabaseError(`Failed to find ${this.model.name} by ID: ${error.message}`);
    }
  }

  async findMany(where = {}, options = {}) {
    try {
      const { skip, take, orderBy, include } = options;
      return await this.model.findMany({
        where,
        skip,
        take,
        orderBy,
        include
      });
    } catch (error) {
      throw new DatabaseError(`Failed to find ${this.model.name} records: ${error.message}`);
    }
  }

  async count(where = {}) {
    try {
      return await this.model.count({ where });
    } catch (error) {
      throw new DatabaseError(`Failed to count ${this.model.name} records: ${error.message}`);
    }
  }

  async update(id, data) {
    try {
      return await this.model.update({
        where: { id },
        data
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundError(`${this.model.name} not found`);
      }
      throw new DatabaseError(`Failed to update ${this.model.name}: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      return await this.model.delete({
        where: { id }
      });
    } catch (error) {
      throw new DatabaseError(`Failed to delete ${this.model.name}: ${error.message}`);
    }
  }

  async findFirst(where = {}, include = {}) {
    try {
      return await this.model.findFirst({
        where,
        include
      });
    } catch (error) {
      throw new DatabaseError(`Failed to find first ${this.model.name}: ${error.message}`);
    }
  }

  async upsert(where, create, update) {
    try {
      return await this.model.upsert({
        where,
        create,
        update
      });
    } catch (error) {
      throw new DatabaseError(`Failed to upsert ${this.model.name}: ${error.message}`);
    }
  }
}

module.exports = BaseRepository;
