const BaseDTO = require('./BaseDTO');

class VendorDTO extends BaseDTO {
  constructor(data = {}) {
    super(data);
  }

  static createVendor(data) {
    return new VendorDTO({
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      postalCode: data.postalCode,
      isActive: data.isActive !== undefined ? data.isActive : true
    });
  }

  static updateVendor(data) {
    const updateData = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.phone) updateData.phone = data.phone;
    if (data.address) updateData.address = data.address;
    if (data.city) updateData.city = data.city;
    if (data.state) updateData.state = data.state;
    if (data.country) updateData.country = data.country;
    if (data.postalCode) updateData.postalCode = data.postalCode;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    return new VendorDTO(updateData);
  }

  static response(vendor) {
    return new VendorDTO({
      id: vendor.id,
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address,
      city: vendor.city,
      state: vendor.state,
      country: vendor.country,
      postalCode: vendor.postalCode,
      isActive: vendor.isActive,
      createdAt: vendor.createdAt,
      updatedAt: vendor.updatedAt
    });
  }
}

module.exports = VendorDTO;
