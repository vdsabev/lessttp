[![Build Status][build-badge]][build]
[![Code Coverage][coverage-badge]][coverage]
[![downloads][downloads-badge]][npmcharts]
[![version][version-badge]][package]
[![MIT License][license-badge]][license]

[![size][size-badge]][unpkg-dist]
[![gzip size][gzip-badge]][unpkg-dist]

<h1 align="center">
  lessttp ⚡
</h1>
<p align="center">Tiny tooling for headless HTTP-based lambda functions</p>

# Installation
```sh
npm install lessttp
```

# Usage
## Basic
Minimum viable async setup for [Netlify Functions](https://docs.netlify.com/functions/build-with-javascript) with built-in:
- `Content-Type=application/json` when you return a JSON object in the body
- 200 success status when there are no errors
- Error handling
- Vaidates that `GET` HTTP method is used

```js
const http = require('lessttp')
const StarWars = require('./services/StarWars')

exports.handler = http.function(async (request) => {
  const jedi = await StarWars.getJedi()
  return {
    body: jedi,
  }
})
```

## Custom error handling
```js
const http = require('lessttp')
const StarWars = require('./services/StarWars')

exports.handler = http.function(async (request) => {
  try {
    const jedi = await StarWars.getJedi()
    return {
      body: jedi,
    }
  } catch (error) {
    console.error(error)
    return {
      statusCode: 502,
      body: 'You were the chosen one!',
    }
  }
})
```

## Custom path parameters
```js
const http = require('lessttp')
const StarWars = require('./services/StarWars')
const baseUrl = '/.netlify/functions'

exports.handler = http.function({
  path: `${baseUrl}/jedi/:id`,
  async handler(request) {
    const { id } = request.params
    const jedi = await (id ? StarWars.getJediById(id) : StarWars.getJedi())
    return {
      body: jedi,
    }
  },
})
```

## Custom HTTP method
The request body is automatically parsed as JSON when available:
```js
const http = require('lessttp')
const StarWars = require('./services/StarWars')

exports.handler = http.function({
  method: 'POST',
  async handler(request) {
    const jedi = await StarWars.createJedi(request.body)
    return {
      body: jedi,
    }
  }
})
```

## Custom request validation
Validate request body and headers using powerful [JSON schemas](http://json-schema.org/understanding-json-schema):
```js
const http = require('lessttp')
const StarWars = require('./services/StarWars')

exports.handler = http.function({
  method: 'POST',
  request: {
    body: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        side: { type: 'string', enum: ['light', 'neutral', 'dark'] },
      },
      required: ['name', 'side'],
    }
  },
  async handler(request) {
    const jedi = await StarWars.createJedi(request.body)
    return {
      body: jedi,
    }
  }
})
```

## Custom usage of middleware
You can use the built-in middleware functions, or write your own:
```js
const http = require('lessttp')
const { alias, validateHttpMethod } = require('lessttp/middleware')
const StarWars = require('./services/StarWars')

exports.handler = http.function({
  method: 'POST',
  middleware() {
    return [
      alias({ httpMethod: 'method', queryStringParameters: 'query' }),
      validateHttpMethod(this.method),
      async function parseBody(request) {
        if (request.body) {
          try {
            request.body = JSON.parse(request.body)
          } catch (error) {
            return {
              statusCode: 400,
              body: 'You were supposed to bring balance to the Force!'
            }
          }
        }
      }
    ]
  },
  async handler(request) {
    const jedi = await StarWars.createJedi(request.body)
    return {
      body: jedi,
    }
  }
})
```

## Disable middleware
Disable the middleware completely and do everything yourself in the handler:
```js
const http = require('lessttp')
const StarWars = require('./services/StarWars')

exports.handler = http.function({
  method: 'POST',
  middleware: null,
  async handler(request) {
    let body
    try {
      body = JSON.parse(request.body)
    } catch (error) {
      console.error(error)
      return {
        statusCode: 400,
        body: 'You were supposed to bring balance to the Force!'
      }
    }

    try {
      const jedi = await StarWars.createJedi(body)
      return {
        body: jedi,
      }
    } catch (error) {
      console.error(error)
      return {
        statusCode: 502,
        body: 'You were the chosen one!',
      }
    }
  }
})
```

## RESTful paths
Easily combine multiple handlers to create REST endpoints:
```js
const http = require('lessttp')
const StarWars = require('./services/StarWars')

exports.handler = http.resource({
  async get() {
    const jedi = await StarWars.getJedi()
    return {
      body: jedi,
    }
  },
  post: {
    request: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          side: { type: 'string', enum: ['light', 'neutral', 'dark'] },
        },
        required: ['name', 'side'],
      }
    },
    async handler(request) {
      const jedi = await StarWars.createJedi(request.body)
      return {
        body: jedi,
      }
    },
  },
})
```

[build-badge]: https://img.shields.io/travis/vdsabev/lessttp.svg?style=flat-square
[build]: https://travis-ci.org/vdsabev/lessttp
[coverage-badge]: https://img.shields.io/codecov/c/github/vdsabev/lessttp.svg?style=flat-square
[coverage]: https://codecov.io/github/vdsabev/lessttp
[version-badge]: https://img.shields.io/npm/v/lessttp.svg?style=flat-square
[package]: https://www.npmjs.com/package/lessttp
[downloads-badge]: https://img.shields.io/npm/dm/lessttp.svg?style=flat-square
[npmcharts]: http://npmcharts.com/compare/lessttp
[license-badge]: https://img.shields.io/npm/l/lessttp.svg?style=flat-square
[license]: https://github.com/vdsabev/lessttp/blob/master/LICENSE.md
[gzip-badge]: http://img.badgesize.io/https://unpkg.com/lessttp/index.min.js?compression=gzip&label=gzip%20size&style=flat-square
[size-badge]: http://img.badgesize.io/https://unpkg.com/lessttp/index.min.js?label=size&style=flat-square
[unpkg-dist]: https://unpkg.com/lessttp
