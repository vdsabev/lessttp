/** @type {import('../types.d').Middleware<[Record<string, any>]>} */
const alias = (config = {}) => {
  return (request, context) => {
    Object.entries(config).forEach(([key, value]) => {
      request[value] = request[key];
    });
  };
};

module.exports = alias;
