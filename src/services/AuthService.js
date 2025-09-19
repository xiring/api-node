const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/UserRepository');
const UserDTO = require('../dtos/UserDTO');
const { UnauthorizedError, ConflictError, BusinessLogicError } = require('../errors');
const { ERROR_MESSAGES, SUCCESS_MESSAGES, JWT } = require('../constants');
const config = require('../config');
const PasswordSecurity = require('../utils/passwordSecurity');
const SecurityLogger = require('../utils/securityLogger');

class AuthService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(userData, req = {}) {
    const { email, password, name, role } = userData;

    // Validate password strength
    if (!PasswordSecurity.isValidPassword(password)) {
      SecurityLogger.logSecurityEvent('WEAK_PASSWORD_ATTEMPT', {
        email,
        ip: req.ip || 'unknown',
        userAgent: req.get ? req.get('User-Agent') : 'unknown'
      });
      throw new BusinessLogicError('Password does not meet security requirements. Must be at least 8 characters with uppercase, lowercase, numbers, and special characters.');
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      SecurityLogger.logSecurityEvent('DUPLICATE_REGISTRATION_ATTEMPT', {
        email,
        ip: req.ip || 'unknown',
        userAgent: req.get ? req.get('User-Agent') : 'unknown'
      });
      throw new ConflictError(ERROR_MESSAGES.DUPLICATE_EMAIL);
    }

    // Hash password with enhanced security
    const hashedPassword = await PasswordSecurity.hashPassword(password, 12);

    // Create user
    const userDataToCreate = UserDTO.createUser({
      name,
      email,
      password: hashedPassword,
      role
    });

    const user = await this.userRepository.create(userDataToCreate.toJSON());

    // Generate JWT token
    const token = this.generateToken(user);

    // Log successful registration
    SecurityLogger.logAuthEvent('REGISTRATION_SUCCESS', user, {
      ip: req.ip || 'unknown',
      userAgent: req.get ? req.get('User-Agent') : 'unknown',
      success: true
    });

    return UserDTO.authResponse(user, token);
  }

  async login(credentials, req = {}) {
    const { email, password } = credentials;

    // Find user
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      SecurityLogger.logAuthEvent('LOGIN_FAILED', { email }, {
        ip: req.ip || 'unknown',
        userAgent: req.get ? req.get('User-Agent') : 'unknown',
        success: false,
        failureReason: 'User not found'
      });
      throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Check password with enhanced security
    const isPasswordValid = await PasswordSecurity.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      SecurityLogger.logAuthEvent('LOGIN_FAILED', user, {
        ip: req.ip || 'unknown',
        userAgent: req.get ? req.get('User-Agent') : 'unknown',
        success: false,
        failureReason: 'Invalid password'
      });
      throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Generate JWT token
    const token = this.generateToken(user);

    // Log successful login
    SecurityLogger.logAuthEvent('LOGIN_SUCCESS', user, {
      ip: req.ip || 'unknown',
      userAgent: req.get ? req.get('User-Agent') : 'unknown',
      success: true
    });

    return UserDTO.authResponse(user, token);
  }

  async getProfile(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return UserDTO.response(user);
  }

  generateToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      throw new UnauthorizedError(ERROR_MESSAGES.INVALID_TOKEN);
    }
  }
}

module.exports = AuthService;
