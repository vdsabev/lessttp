const qs = require('qs');

/** @type {import('../types.d').Middleware<[string | null | undefined]>} */
const parseQuery = () => {
  return async (request, context) => {
    request.queryStringParameters = qs.parse(request.queryStringParameters);
  };
};

module.exports = parseQuery;
