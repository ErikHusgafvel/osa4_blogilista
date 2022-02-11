const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const helper = require('./api_helper.test')

let token

describe('when there is initally some blogs and a user saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('salainen', 10)
    const user = new User({
      username: 'root',
      passwordHash
    })

    await user.save()

    const response = await api
      .post('/api/login')
      .send({
        username: 'root',
        password: 'salainen'
      })

    token = response.body.token
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
        .set({ Authorization: `bearer ${token}` })
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

    test('a valid blog without credentials can not be added with status code 401', async () => {
      const newBlog = {
        title: '9 things most get wrong about usability testing – and how to fix them',
        author: 'Karri-Pekka Laakso',
        url: 'https://www.reaktor.com/blog/9-things-most-get-wrong-about-usability-testing-and-how-to-fix-them/',
        likes: 5
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)

      const blogsAtEnd = await helper.blogsInDb()
      const titles = blogsAtEnd.map(blog => blog.title)

      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
      expect(titles).not.toContain(
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
        .set({ Authorization: `bearer ${token}` })
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
        .set({ Authorization: `bearer ${token}` })
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
        .set({ Authorization: `bearer ${token}` })
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
    })
  })

  describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()

      /** Adding blog to db that is later deleted */
      const newBlog = {
        title: '9 things most get wrong about usability testing – and how to fix them',
        author: 'Karri-Pekka Laakso',
        url: 'https://www.reaktor.com/blog/9-things-most-get-wrong-about-usability-testing-and-how-to-fix-them/',
        likes: 5
      }

      const response = await api
        .post('/api/blogs')
        .set({ Authorization: `bearer ${token}` })
        .send(newBlog)
        .expect(201)

      /** Making sure that the blog was added */
      const blogsAtMiddle = await helper.blogsInDb()
      const titlesAtMiddle = blogsAtMiddle.map(blog => blog.title)

      expect(blogsAtMiddle).toHaveLength(helper.initialBlogs.length + 1)
      expect(titlesAtMiddle).toContain(
        '9 things most get wrong about usability testing – and how to fix them'
      )

      /** Starting to test deleting */
      const blogToDelete = response._body

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set({ Authorization: `bearer ${token}` })
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd).toHaveLength(blogsAtStart.length)

      const titlesAtEnd = blogsAtEnd.map(blog => blog.title)
      expect(titlesAtEnd).not.toContain(
        '9 things most get wrong about usability testing – and how to fix them'
      )
    })

    test('fails with status code 204 if non-existing blog with valid id', async () => {
      const id = await helper.nonExistingId()
      const blogsAtStart = await helper.blogsInDb()

      await api
        .delete(`/api/blogs/${id}`)
        .set({ Authorization: `bearer ${token}` })
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

  describe('updating likes for a blog', () => {
    test('adding one like to existing blog', async () => {
      const blogs = await helper.blogsInDb()
      const blog = blogs[0]
      const likesAtStart = blog.likes
      const likesIncrement = likesAtStart + 1

      await api
        .put(`/api/blogs/${blog.id}`)
        .send( { likes: likesIncrement } )
        .expect(200)

      const response = await api
        .get(`/api/blogs/${blog.id}`)

      expect(response.body.likes).toBe(likesAtStart + 1)
    })
  })
})


afterAll(() => {
  mongoose.connection.close()
})