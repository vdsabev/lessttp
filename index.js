const { STATUS_CODES: statuses } = require('http')
const {
  alias,
  validateHttpMethod,
  parseBody,
  validateRequest,
} = require('./middleware')

/** @typedef {import('./types.d').Controller} Controller */
/** @typedef {import('./types.d').Handler} Handler */
/** @typedef {import('./types.d').Response} Response */

const http = exports

/** @returns {Handler} */
http.function = (/** @type {Handler | Controller} */ handlerOrController) => {
  const controller =
    typeof handlerOrController === 'function'
      ? { handler: handlerOrController }
      : handlerOrController

  const middleware =
    typeof controller.middleware === 'function'
      ? controller.middleware()
      : 'middleware' in controller
      ? controller.middleware
      : [
          alias({ httpMethod: 'method', queryStringParameters: 'query' }),
          validateHttpMethod(controller.method || 'GET'),
          parseBody(),
          validateRequest(controller.request),
        ]

  const handlers = [...middleware, controller.handler]

  return async (request, context) => {
    console.log(`request.url`, request.url)
    try {
      for (const handler of handlers) {
        const response = await handler(request, context)
        if (response) {
          const isJSON = response.body && typeof response.body === 'object'
          return {
            statusCode: response.body ? 200 : 204,
            ...response,
            body: isJSON ? JSON.stringify(response.body) : response.body,
            headers: {
              'Content-Type': isJSON
                ? 'application/json'
                : 'text/html; charset=utf-8',
              ...response.headers,
            },
          }
        }
        // Otherwise continues to the next handler automatically
      }
    } catch (error) {
      // Built-in error handling
      const statusCode = (error.response && error.response.statusCode) || 500
      const body =
        (error.response && error.response.body) || statuses[statusCode]
      return {
        ...error.response,
        statusCode,
        body,
      }
    }

    // No handlers returned a response, return a 404 Not Found error
    return {
      statusCode: 404,
      body: statuses[404],
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    }
  }
}
