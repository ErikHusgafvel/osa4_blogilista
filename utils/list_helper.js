const lodash = require('lodash')

const dummy = (/*blogs*/) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.length === 0
    ? 0 : blogs.reduce((sum, blog) => (sum + blog.likes), 0)
}

const favoriteBlog = (blogs) => {
  return blogs.length === 0 ? {} :
    blogs.reduce((currentBlog, newBlog) => {
      return currentBlog.likes > newBlog.likes
        ? currentBlog :
        {
          title: newBlog.title,
          author: newBlog.author,
          likes: newBlog.likes
        }
    }, {})
}

const mostBlogs = (blogs) => {
  return blogs.length === 0 ? {} :
    lodash(blogs)
      .groupBy('author')
      .map((blogs, author) => {
        return {
          author: author,
          blogs: blogs.length
        }
      })
      .value()
      .reduce((currentBlogger, newBlogger) => {
        return currentBlogger.blogs > newBlogger.blogs ? currentBlogger : newBlogger
      }, {})
}

const mostLikes = (blogs) => {
  return blogs.length === 0 ? {} :
    lodash(blogs)
      .groupBy('author')
      .map((blogs, author) => {
        return {
          author: author,
          likes: blogs.reduce((sum, blog) => (sum + blog.likes), 0)
        }
      })
      .value()
      .reduce((currentBlogger, newBlogger) => {
        return currentBlogger.likes > newBlogger.likes ? currentBlogger : newBlogger
      }, {})
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}