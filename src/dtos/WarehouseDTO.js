const BaseDTO = require('./BaseDTO');

class WarehouseDTO extends BaseDTO {
  constructor(data = {}) {
    super(data);
  }

  static createWarehouse(data) {
    return new WarehouseDTO({
      name: data.name,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      postalCode: data.postalCode,
      capacity: data.capacity,
      isActive: data.isActive !== undefined ? data.isActive : true
    });
  }

  static updateWarehouse(data) {
    const updateData = {};
    if (data.name) updateData.name = data.name;
    if (data.address) updateData.address = data.address;
    if (data.city) updateData.city = data.city;
    if (data.state) updateData.state = data.state;
    if (data.country) updateData.country = data.country;
    if (data.postalCode) updateData.postalCode = data.postalCode;
    if (data.capacity) updateData.capacity = data.capacity;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    return new WarehouseDTO(updateData);
  }

  static response(warehouse) {
    return new WarehouseDTO({
      id: warehouse.id,
      name: warehouse.name,
      address: warehouse.address,
      city: warehouse.city,
      state: warehouse.state,
      country: warehouse.country,
      postalCode: warehouse.postalCode,
      capacity: warehouse.capacity,
      isActive: warehouse.isActive,
      createdAt: warehouse.createdAt,
      updatedAt: warehouse.updatedAt
    });
  }
}

module.exports = WarehouseDTO;
