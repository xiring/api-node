const VendorRepository = require('../repositories/VendorRepository');
const VendorDTO = require('../dtos/VendorDTO');
const { NotFoundError, ConflictError } = require('../errors');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../constants');

class VendorService {
  constructor() {
    this.vendorRepository = new VendorRepository();
  }

  async createVendor(vendorData) {
    const { email } = vendorData;

    // Check if vendor already exists
    const existingVendor = await this.vendorRepository.findByEmail(email);
    if (existingVendor) {
      throw new ConflictError(ERROR_MESSAGES.DUPLICATE_EMAIL);
    }

    const vendorDataToCreate = VendorDTO.createVendor(vendorData);
    const vendor = await this.vendorRepository.create(vendorDataToCreate.toJSON());

    return VendorDTO.response(vendor);
  }

  async getVendors(options = {}) {
    const { page = 1, limit = 10, search, city, isActive } = options;

    return await this.vendorRepository.findManyWithPagination({}, {
      page,
      limit,
      search,
      city,
      isActive
    });
  }

  async getVendorById(id) {
    const vendor = await this.vendorRepository.findById(id);
    if (!vendor) {
      throw new NotFoundError(ERROR_MESSAGES.VENDOR_NOT_FOUND);
    }

    return VendorDTO.response(vendor);
  }

  async updateVendor(id, updateData) {
    const vendorDataToUpdate = VendorDTO.updateVendor(updateData);
    const vendor = await this.vendorRepository.update(id, vendorDataToUpdate.toJSON());
    return VendorDTO.response(vendor);
  }

  async deleteVendor(id) {
    await this.vendorRepository.delete(id);
    return { message: SUCCESS_MESSAGES.VENDOR_DELETED };
  }

  async getVendorsByCity(city) {
    const vendors = await this.vendorRepository.findByCity(city);
    return vendors.map(vendor => VendorDTO.response(vendor));
  }
}

module.exports = VendorService;
