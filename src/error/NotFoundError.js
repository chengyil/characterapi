const ErrorResponse = require('./ErrorResponse');

module.exports = class NotFoundError extends ErrorResponse {
  constructor(message) {
    super(message);
    this.code = 404;
  }
};
