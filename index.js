const { STATUS_CODES: statuses } = require('http')
const {
  alias,
  validateHttpMethod,
  parseBody,
  parseParams,
  validateRequest,
} = require('./middleware')

/** @typedef {import('./types.d').Handler} Handler */
/** @typedef {import('./types.d').HttpFunction} HttpFunction */
/** @typedef {import('./types.d').HttpResource} HttpResource */

const http = exports

// Function
/** @returns {Handler} */
http.function = (/** @type {Handler | HttpFunction} */ handlerOrFunction) => {
  const controller = isHandler(handlerOrFunction)
    ? { handler: handlerOrFunction }
    : handlerOrFunction

  const middleware =
    typeof controller.middleware === 'function'
      ? controller.middleware()
      : 'middleware' in controller
      ? controller.middleware
      : [
          alias({ httpMethod: 'method', queryStringParameters: 'query' }),
          validateHttpMethod(controller.method || 'GET'),
          parseBody(),
          parseParams(controller.path),
          validateRequest(controller.request),
        ]

  const handlers = [...middleware, controller.handler]

  return async (request, context) => {
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
        (error.response && error.response.body) ||
        error.message ||
        statuses[statusCode]
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

// Resource
/** @returns {Handler} */
http.resource = (/** @type {HttpResource} */ resource) => {
  /** @type {Record<string, Handler>} */
  const handlers = Object.keys(resource).reduce((handlers, key) => {
    const handlerOrController = resource[key]
    const method = key.toUpperCase()
    return {
      ...handlers,
      [key]: http.function(
        isHandler(handlerOrController)
          ? { handler: handlerOrController, method }
          : { ...handlerOrController, method }
      ),
    }
  }, {})

  return async (request, context) => {
    const handler = handlers[request.method.toUpperCase()]
    if (!handler) {
      const allowedMethods = Object.keys(handlers).join(', ')
      return {
        statusCode: 405,
        headers: { Allow: allowedMethods },
      }
    }

    return handler(request, context)
  }
}

/** @returns {handlerOrController is Handler} */
const isHandler = (/** @type {Handler | any} */ handlerOrController) =>
  typeof handlerOrController === 'function'
