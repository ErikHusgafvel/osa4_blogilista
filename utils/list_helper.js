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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}