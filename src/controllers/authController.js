const AuthService = require('../services/AuthService');
const ResponseHelper = require('../utils/response');
const { SUCCESS_MESSAGES } = require('../constants');

class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  register = async (req, res, next) => {
    try {
      const result = await this.authService.register(req.body, req);
      ResponseHelper.created(res, result, SUCCESS_MESSAGES.USER_CREATED);
    } catch (error) {
      next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const result = await this.authService.login(req.body, req);
      ResponseHelper.success(res, result, SUCCESS_MESSAGES.LOGIN_SUCCESS);
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req, res, next) => {
    try {
      const result = await this.authService.getProfile(req.user.id);
      ResponseHelper.success(res, { user: result }, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AuthController();