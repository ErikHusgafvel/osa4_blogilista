const blogsRouter = require('express').Router()
const Blog = require('../models/blog.js')

/** Please, notice that the app is using export-async-errors library!
 * Thus, errors are handled "under the hood".
 * Library passes the error automatically to the errorHandling-middleware
 * defined in '../utils/middleware.js' taken to use in '../app.js'
 *
 * Thus, no async/await try-catch or Promise.then(...).catch(...) structures are needed!
 */

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)

  const savedBlog = await blog.save()
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

module.exports = blogsRouter