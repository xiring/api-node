const winston = require('winston');
const config = require('../config');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  config.nodeEnv === 'test' ? winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ) : winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    )
  )
);

// Define transports (date-stamped files)
const dateStamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: `logs/${dateStamp}-error.log`,
    level: 'error',
  }),
  new winston.transports.File({ filename: `logs/${dateStamp}-combined.log` }),
];

// Create logger
const logger = winston.createLogger({
  level: config.nodeEnv === 'development' ? 'debug' : 'warn',
  levels,
  format,
  transports,
});

module.exports = logger;
