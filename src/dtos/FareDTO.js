const BaseDTO = require('./BaseDTO');

class FareDTO extends BaseDTO {
  constructor(data = {}) {
    super(data);
  }

  static createFare(data) {
    return new FareDTO({
      fromCity: data.fromCity,
      toCity: data.toCity,
      branchDelivery: data.branchDelivery,
      codBranch: data.codBranch,
      doorDelivery: data.doorDelivery,
      isActive: data.isActive !== undefined ? data.isActive : true
    });
  }

  static updateFare(data) {
    const updateData = {};
    if (data.fromCity) updateData.fromCity = data.fromCity;
    if (data.toCity) updateData.toCity = data.toCity;
    if (data.branchDelivery) updateData.branchDelivery = data.branchDelivery;
    if (data.codBranch) updateData.codBranch = data.codBranch;
    if (data.doorDelivery) updateData.doorDelivery = data.doorDelivery;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    return new FareDTO(updateData);
  }

  static response(fare) {
    return new FareDTO({
      id: fare.id,
      fromCity: fare.fromCity,
      toCity: fare.toCity,
      branchDelivery: fare.branchDelivery,
      codBranch: fare.codBranch,
      doorDelivery: fare.doorDelivery,
      isActive: fare.isActive,
      createdAt: fare.createdAt,
      updatedAt: fare.updatedAt
    });
  }
}

module.exports = FareDTO;
