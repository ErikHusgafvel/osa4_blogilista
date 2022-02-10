const logger = require('./logger')
const jwt = require('jsonwebtoken')

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token = authorization.substring(7)
  }

  next()
}

const userExtractor = (request, response, next) => {
  const user = request.token === undefined
    ? false
    : jwt.verify(request.token, process.env.SECRET)

  if (user) {
    request.user = user
  }

  next()
}

module.exports = {
  errorHandler,
  tokenExtractor,
  userExtractor
}