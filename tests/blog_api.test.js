const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const helper = require('./api_helper.test')

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs
    .map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)

  /* Saving new blog objects to db could also have been done in either ways:
  (1)
  for (let blog of helper.initialBlogs) { //for..of structure maintains the order (objects will be saved in same order as in the helper.initialBlogs)
    let blogObject = new Blog(blog)
    await blogObject.save()
  }

  (2)
  await Blog.insertMany(helper.initialBlogs)
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

describe('testing adding', () => {
  test('a valid blog can be added', async () => {
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

  test('a blog without likes is accepted', async () => {
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

  test('a blog without title is rejected', async () => {
    const blogsAtBeginning = await helper.blogsInDb()

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
    expect(blogsAtEnd).toHaveLength(blogsAtBeginning.length)
  })

  test('a blog without url is rejected', async () => {
    const blogsAtBeginning = await helper.blogsInDb()

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
    expect(blogsAtEnd).toHaveLength(blogsAtBeginning.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})