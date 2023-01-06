const qs = require('qs');

/** @type {import('../types.d').Middleware<[string | null | undefined]>} */
const parseQuery = () => {
  return async (request, context) => {
    // The query is already shallow-parsed - `qs` parses deeply nested objects, if any
    request.queryStringParameters = qs.parse(request.queryStringParameters);
  };
};

module.exports = parseQuery;
