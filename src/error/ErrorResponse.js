module.exports = class ErrorResponse extends Error {
  constructor(message) {
    super(message);
    this.code = 500;
  }
};
