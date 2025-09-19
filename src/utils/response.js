const { HTTP_STATUS } = require('../constants');

class ResponseHelper {
  static success(res, data, message = 'Success', statusCode = HTTP_STATUS.OK) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  static error(res, message = 'Error', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, details = null) {
    const response = {
      success: false,
      message,
      error: {
        statusCode,
        message
      }
    };

    if (details) {
      response.error.details = details;
    }

    return res.status(statusCode).json(response);
  }

  static paginated(res, data, pagination, message = 'Success', statusCode = HTTP_STATUS.OK) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      pagination
    });
  }

  static created(res, data, message = 'Created successfully') {
    return this.success(res, data, message, HTTP_STATUS.CREATED);
  }

  static noContent(res, message = 'No content') {
    return res.status(HTTP_STATUS.NO_CONTENT).json({
      success: true,
      message
    });
  }
}

module.exports = ResponseHelper;
