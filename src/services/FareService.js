const FareRepository = require('../repositories/FareRepository');
const FareDTO = require('../dtos/FareDTO');
const { NotFoundError, ConflictError, BusinessLogicError } = require('../errors');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../constants');

class FareService {
  constructor() {
    this.fareRepository = new FareRepository();
  }

  async createFare(fareData) {
    const { fromCity, toCity } = fareData;

    // Check if fare route already exists
    const existingFare = await this.fareRepository.findUniqueRoute(fromCity, toCity);
    if (existingFare) {
      throw new ConflictError(ERROR_MESSAGES.DUPLICATE_FARE_ROUTE);
    }

    const fareDataToCreate = FareDTO.createFare(fareData);
    const fare = await this.fareRepository.create(fareDataToCreate.toJSON());

    return FareDTO.response(fare);
  }

  async getFares(options = {}) {
    const { page = 1, limit = 10, fromCity, toCity, isActive } = options;

    return await this.fareRepository.findManyWithPagination({}, {
      page,
      limit,
      fromCity,
      toCity,
      isActive
    });
  }

  async getFareById(id) {
    const fare = await this.fareRepository.findById(id);
    if (!fare) {
      throw new NotFoundError(ERROR_MESSAGES.FARE_NOT_FOUND);
    }

    return FareDTO.response(fare);
  }

  async updateFare(id, updateData) {
    const fareDataToUpdate = FareDTO.updateFare(updateData);
    const fare = await this.fareRepository.update(id, fareDataToUpdate.toJSON());
    return FareDTO.response(fare);
  }

  async deleteFare(id) {
    await this.fareRepository.delete(id);
    return { message: SUCCESS_MESSAGES.FARE_DELETED };
  }

  async getFareByRoute(fromCity, toCity) {
    const fare = await this.fareRepository.findByRoute(fromCity, toCity);
    if (!fare) {
      throw new NotFoundError(ERROR_MESSAGES.FARE_NOT_FOUND_FOR_ROUTE);
    }

    return FareDTO.response(fare);
  }
}

module.exports = FareService;
