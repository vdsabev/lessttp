/** @type {import('../types.d').Middleware} */
const parseBody = () => {
  return async (request, context) => {
    if (request.body) {
      try {
        request.body = JSON.parse(request.body)
      } catch (error) {
        throw new BodyParseError()
      }
    }
  }
}

module.exports = parseBody

class BodyParseError extends Error {
  response = {
    statusCode: 400,
  }
}
