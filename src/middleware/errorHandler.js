const logger = require('../utils/logger');
const ResponseHelper = require('../utils/response');
const { AppError } = require('../errors');
const { HTTP_STATUS } = require('../constants');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(err);

  // Prisma errors
  if (err.code === 'P2002') {
    const message = 'Duplicate field value entered';
    error = new AppError(message, HTTP_STATUS.CONFLICT);
  }

  if (err.code === 'P2025') {
    const message = 'Record not found';
    error = new AppError(message, HTTP_STATUS.NOT_FOUND);
  }

  if (err.code === 'P2003') {
    const message = 'Foreign key constraint failed';
    error = new AppError(message, HTTP_STATUS.BAD_REQUEST);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AppError(message, HTTP_STATUS.UNAUTHORIZED);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AppError(message, HTTP_STATUS.UNAUTHORIZED);
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    const message = 'Validation error';
    error = new AppError(message, HTTP_STATUS.BAD_REQUEST);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Invalid ID format';
    error = new AppError(message, HTTP_STATUS.BAD_REQUEST);
  }

  // Default error
  if (!(error instanceof AppError)) {
    error = new AppError('Internal server error', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  ResponseHelper.error(
    res,
    error.message,
    error.statusCode,
    error.details || null
  );
};

const notFound = (req, res) => {
  ResponseHelper.error(
    res,
    `Route ${req.originalUrl} not found`,
    HTTP_STATUS.NOT_FOUND
  );
};

module.exports = {
  errorHandler,
  notFound
};