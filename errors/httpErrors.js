class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = "BadRequestError";
    this.code = 400;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
    this.code = 404;
  }
}

class ServerError extends Error {
  constructor(message) {
    super(message);
    this.name = "ServerError";
    this.code = 500;
  }
}

class MethodError extends Error {
  constructor(message) {
    super(message);
    this.name = "MethodError";
    this.code = 501;
  }
}

module.exports = { BadRequestError, NotFoundError, ServerError, MethodError };
