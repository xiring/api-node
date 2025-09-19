const VendorService = require('../services/VendorService');
const ResponseHelper = require('../utils/response');
const { SUCCESS_MESSAGES } = require('../constants');

class VendorController {
  constructor() {
    this.vendorService = new VendorService();
  }

  getAllVendors = async (req, res, next) => {
    try {
      const result = await this.vendorService.getVendors(req.query);
      ResponseHelper.paginated(res, result.vendors, result.pagination, 'Vendors retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getVendorById = async (req, res, next) => {
    try {
      const result = await this.vendorService.getVendorById(req.params.id);
      ResponseHelper.success(res, { vendor: result }, 'Vendor retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  createVendor = async (req, res, next) => {
    try {
      const result = await this.vendorService.createVendor(req.body);
      ResponseHelper.created(res, { vendor: result }, SUCCESS_MESSAGES.VENDOR_CREATED);
    } catch (error) {
      next(error);
    }
  };

  updateVendor = async (req, res, next) => {
    try {
      const result = await this.vendorService.updateVendor(req.params.id, req.body);
      ResponseHelper.success(res, { vendor: result }, SUCCESS_MESSAGES.VENDOR_UPDATED);
    } catch (error) {
      next(error);
    }
  };

  deleteVendor = async (req, res, next) => {
    try {
      const result = await this.vendorService.deleteVendor(req.params.id);
      ResponseHelper.success(res, result, SUCCESS_MESSAGES.VENDOR_DELETED);
    } catch (error) {
      next(error);
    }
  };

  getVendorsByCity = async (req, res, next) => {
    try {
      const result = await this.vendorService.getVendorsByCity(req.params.city);
      ResponseHelper.success(res, { vendors: result }, 'Vendors retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new VendorController();