const AuthService = require('../services/AuthService');
const { UnauthorizedError, ForbiddenError } = require('../errors');
const { USER_ROLES } = require('../constants');

class AuthMiddleware {
  constructor() {
    this.authService = new AuthService();
  }

  authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new UnauthorizedError('Access token required');
    }

    try {
      const user = this.authService.verifyToken(token);
      req.user = user;
      next();
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  };

  requireRole = (roles) => {
    return (req, res, next) => {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      if (!roles.includes(req.user.role)) {
        throw new ForbiddenError('Insufficient permissions');
      }

      next();
    };
  };

  requireAdmin = this.requireRole([USER_ROLES.ADMIN]);
  requireManager = this.requireRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER]);
  requireUser = this.requireRole([USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.USER]);
}

const authMiddleware = new AuthMiddleware();

module.exports = {
  authenticateToken: authMiddleware.authenticateToken,
  requireRole: authMiddleware.requireRole,
  requireAdmin: authMiddleware.requireAdmin,
  requireManager: authMiddleware.requireManager,
  requireUser: authMiddleware.requireUser
};