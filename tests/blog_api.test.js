const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const helper = require('./api_helper.test')

describe('when there is initally some blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)

    /**
     * Saving new blog objects to db could also have been done in either ways:
     *
     * (1)
     * const blogObjects = helper.initialBlogs
     *  .map(blog => new Blog(blog))
     * const promiseArray = blogObjects.map(blog => blog.save())
     * await Promise.all(promiseArray)
     *
     * (2)
     * for (let blog of helper.initialBlogs) { //for..of structure maintains the order (objects will be saved in same order as in the helper.initialBlogs)
     *  let blogObject = new Blog(blog)
     *  await blogObject.save()
     * }
     */

  })

  test('blogs are returned as json', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('blog has id field', async () => {
    const response = await api
      .get('/api/blogs')

    expect(response.body[0].id).toBeDefined()
  })

  describe('adding a blog with POST', () => {
    test('a valid blog can be added with status code 201', async () => {
      const newBlog = {
        title: '9 things most get wrong about usability testing – and how to fix them',
        author: 'Karri-Pekka Laakso',
        url: 'https://www.reaktor.com/blog/9-things-most-get-wrong-about-usability-testing-and-how-to-fix-them/',
        likes: 5
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)

      const blogsAtEnd = await helper.blogsInDb()
      const titles = blogsAtEnd.map(blog => blog.title)

      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
      expect(titles).toContain(
        '9 things most get wrong about usability testing – and how to fix them'
      )
      /*
      api
        .post('/api/blogs').send(newBlog)
        .then(() => {
          expect(201)
        })
        .catch(err => console.log(err.message))

      api
        .get('/api/blogs')
        .then(response => {
          const titles = response.body.map(blog => blog.title)
          expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
          expect(titles).toContain(
            '9 things most get wrong about usability testing – and how to fix them'
          )
        })
        .catch(err => console.log(err.message))
      */
    })

    test('a blog without likes is accepted with status code 201', async () => {
      const newBlog = {
        title: '9 things most get wrong about usability testing – and how to fix them',
        author: 'Karri-Pekka Laakso',
        url: 'https://www.reaktor.com/blog/9-things-most-get-wrong-about-usability-testing-and-how-to-fix-them/'
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)

      const blogsAtEnd = await helper.blogsInDb()
      const titles = blogsAtEnd.map(blog => blog.title)
      expect(titles).toContain(
        '9 things most get wrong about usability testing – and how to fix them'
      )
      expect(blogsAtEnd[blogsAtEnd.length - 1].likes).toBe(0)
    })

    test('a blog without title is rejected with status code 400', async () => {
      const blogsAtStart= await helper.blogsInDb()

      const newBlog = {
        author: 'Karri-Pekka Laakso',
        url: 'https://www.reaktor.com/blog/9-things-most-get-wrong-about-usability-testing-and-how-to-fix-them/',
        likes: 4
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
    })

    test('a blog without url is rejected with status code 400', async () => {
      const blogsAtStart = await helper.blogsInDb()

      const newBlog = {
        title: '9 things most get wrong about usability testing – and how to fix them',
        author: 'Karri-Pekka Laakso',
        likes: 4
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
    })
  })

  describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1)

      const titles = blogsAtEnd.map(blog => blog.title)
      expect(titles).not.toContain(blogToDelete.title)
    })

    test('fails with status code 204 if non-existing blog with valid id', async () => {
      const id = await helper.nonExistingId()
      const blogsAtStart = await helper.blogsInDb()

      await api
        .delete(`/api/blogs/${id}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
    })

    test('fails with status code 400 if invalid id', async () => {
      const invalidId = '5a3d5da59070081a82a3445'
      const blogsAtStart = await helper.blogsInDb()

      await api
        .delete(`/api/blogs/${invalidId}`)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
    })
  })
})


afterAll(() => {
  mongoose.connection.close()
})