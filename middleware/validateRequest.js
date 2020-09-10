const Ajv = require('ajv')

/** @typedef {import('../types.d').RequestValidation} RequestValidation  */

const validator = new Ajv({ allErrors: true, coerceTypes: true })

/** @type {import('../types.d').Middleware<[RequestValidation]>}  */
const validateRequest = (requestValidation) => {
  const validate = requestValidation
    ? validator.compile({ type: 'object', properties: requestValidation })
    : null

  return (request, context) => {
    const isValid = !validate || validate(request)
    if (!isValid) {
      const message = validate.errors
        .map((error) => `request${error.dataPath} ${error.message}`)
        .join('\n')
      throw new RequestValidationError(message)
    }
  }
}

module.exports = validateRequest

class RequestValidationError extends Error {
  response = {
    statusCode: 400,
  }
}
