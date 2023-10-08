module.exports = class DiscordDBError extends Error {
  constructor (message) {
    super(message);
    this.name = "DiscordDBError";
    Error.captureStackTrace(this, DiscordDBError);
  }
}