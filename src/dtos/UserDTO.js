const BaseDTO = require('./BaseDTO');
const { USER_ROLES } = require('../constants');

class UserDTO extends BaseDTO {
  constructor(data = {}) {
    super(data);
  }

  static createUser(data) {
    return new UserDTO({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role || USER_ROLES.USER
    });
  }

  static updateUser(data) {
    const updateData = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.role) updateData.role = data.role;
    return new UserDTO(updateData);
  }

  static response(user) {
    return new UserDTO({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  }

  static authResponse(user, token, refreshToken) {
    return new UserDTO({
      message: 'Authentication successful',
      user: UserDTO.response(user).toJSON(),
      token,
      refreshToken
    });
  }
}

module.exports = UserDTO;
