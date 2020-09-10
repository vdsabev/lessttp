const pathern = require('pathern')

/** @type {import('../types.d').Middleware<[string | null | undefined]>} */
const parseParams = (path) => {
  return async (request, context) => {
    const params = pathern.extract(path || '', request.path || '')
    request.params = Object.keys(params)
      .filter((key) => params[key])
      .reduce(
        (filteredParams, key) => ({ ...filteredParams, [key]: params[key] }),
        {}
      )
  }
}

module.exports = parseParams
