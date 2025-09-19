const AppError = require('./AppError');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../constants');

class ValidationError extends AppError {
  constructor(message = ERROR_MESSAGES.VALIDATION_ERROR, details = []) {
    super(message, HTTP_STATUS.BAD_REQUEST);
    this.details = details;
  }
}

class UnauthorizedError extends AppError {
  constructor(message = ERROR_MESSAGES.UNAUTHORIZED) {
    super(message, HTTP_STATUS.UNAUTHORIZED);
  }
}

class ForbiddenError extends AppError {
  constructor(message = ERROR_MESSAGES.FORBIDDEN) {
    super(message, HTTP_STATUS.FORBIDDEN);
  }
}

class NotFoundError extends AppError {
  constructor(message = ERROR_MESSAGES.NOT_FOUND) {
    super(message, HTTP_STATUS.NOT_FOUND);
  }
}

class ConflictError extends AppError {
  constructor(message = ERROR_MESSAGES.CONFLICT) {
    super(message, HTTP_STATUS.CONFLICT);
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

class BusinessLogicError extends AppError {
  constructor(message, statusCode = HTTP_STATUS.BAD_REQUEST) {
    super(message, statusCode);
  }
}

module.exports = {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  BusinessLogicError
};
