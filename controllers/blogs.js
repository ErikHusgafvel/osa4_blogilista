const jwt = require('jsonwebtoken')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog.js')
const User = require('../models/user')

/** Please, notice that the app is using export-async-errors library!
 * Thus, errors are handled "under the hood".
 * Library passes the error automatically to the errorHandling-middleware
 * defined in '../utils/middleware.js' taken to use in '../app.js'
 *
 * Thus, no async/await try-catch or Promise.then(...).catch(...) structures are needed!
 */


blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username : 1, user : 1 })
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const user = await User.findById(decodedToken.id)

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    user: user._id,
    likes: body.likes
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const user = request.token === undefined
    ? false
    : jwt.verify(request.token, process.env.SECRET)
  const blog = await Blog.findById(request.params.id)
  if( user.id && blog.user && blog.user.toString() === user.id.toString() ) {
    await Blog.findByIdAndRemove(request.params.id)
    return response.status(204).end()
  }
  return response.status(401).json({ error: 'unauthorized action: missing token or unauthorized user' })
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body
  const blog = {
    'likes': body.likes
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true, runValidators: true })
  response.status(200).json(updatedBlog)

})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  response.status(200).json(blog)
})

module.exports = blogsRouter