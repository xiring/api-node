class BaseDTO {
  constructor(data = {}) {
    this.data = data;
  }

  toJSON() {
    return this.data;
  }

  validate() {
    throw new Error('validate() method must be implemented by subclass');
  }

  static fromJSON(json) {
    return new this(json);
  }
}

module.exports = BaseDTO;
