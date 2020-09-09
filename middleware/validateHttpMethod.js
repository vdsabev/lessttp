/** @type {import('../types.d').Middleware<[string]>}  */
const validateHttpMethod = (allowedMethod) => {
  return async (request, context) => {
    if (request.method !== allowedMethod) {
      throw new InvalidHttpMethodError(allowedMethod)
    }
  }
}

module.exports = validateHttpMethod

class InvalidHttpMethodError extends Error {
  constructor(allowedMethod, ...args) {
    super(...args)
    this.response = {
      statusCode: 405,
      headers: { Allow: allowedMethod },
    }
  }
}
