module.exports = class Response {
  constructor(status, data) {
    this.status = status;
    this.data = data;
  }
};
