const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/UserRepository');
const UserDTO = require('../dtos/UserDTO');
const { UnauthorizedError, ConflictError, BusinessLogicError } = require('../errors');
const { ERROR_MESSAGES, SUCCESS_MESSAGES, JWT } = require('../constants');
const config = require('../config');

class AuthService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(userData) {
    const { email, password, name, role } = userData;

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError(ERROR_MESSAGES.DUPLICATE_EMAIL);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

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

    return UserDTO.authResponse(user, token);
  }

  async login(credentials) {
    const { email, password } = credentials;

    // Find user
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Generate JWT token
    const token = this.generateToken(user);

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
