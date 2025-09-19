const WarehouseRepository = require('../repositories/WarehouseRepository');
const WarehouseDTO = require('../dtos/WarehouseDTO');
const { NotFoundError } = require('../errors');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../constants');

class WarehouseService {
  constructor() {
    this.warehouseRepository = new WarehouseRepository();
  }

  async createWarehouse(warehouseData) {
    const warehouseDataToCreate = WarehouseDTO.createWarehouse(warehouseData);
    const warehouse = await this.warehouseRepository.create(warehouseDataToCreate.toJSON());

    return WarehouseDTO.response(warehouse);
  }

  async getWarehouses(options = {}) {
    const { page = 1, limit = 10, search, city, isActive } = options;

    return await this.warehouseRepository.findManyWithPagination({}, {
      page,
      limit,
      search,
      city,
      isActive
    });
  }

  async getWarehouseById(id) {
    const warehouse = await this.warehouseRepository.findById(id);
    if (!warehouse) {
      throw new NotFoundError(ERROR_MESSAGES.WAREHOUSE_NOT_FOUND);
    }

    return WarehouseDTO.response(warehouse);
  }

  async updateWarehouse(id, updateData) {
    const warehouseDataToUpdate = WarehouseDTO.updateWarehouse(updateData);
    const warehouse = await this.warehouseRepository.update(id, warehouseDataToUpdate.toJSON());
    return WarehouseDTO.response(warehouse);
  }

  async deleteWarehouse(id) {
    await this.warehouseRepository.delete(id);
    return { message: SUCCESS_MESSAGES.WAREHOUSE_DELETED };
  }

  async getWarehousesByCity(city) {
    const warehouses = await this.warehouseRepository.findByCity(city);
    return warehouses.map(warehouse => WarehouseDTO.response(warehouse));
  }
}

module.exports = WarehouseService;
