const { AsyncLocalStorage } = require('async_hooks');
const { randomUUID } = require('crypto');

const als = new AsyncLocalStorage();

function requestContext() {
  return (req, res, next) => {
    const requestId = req.headers['x-request-id'] || randomUUID();
    const context = { requestId, startTime: Date.now() };
    als.run(context, () => {
      res.setHeader('X-Request-Id', requestId);
      next();
    });
  };
}

function getRequestContext() {
  return als.getStore() || { requestId: 'unknown' };
}

module.exports = { requestContext, getRequestContext };


