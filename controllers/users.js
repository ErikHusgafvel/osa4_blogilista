const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response) => {
  const body = request.body

  /** Password validation */
  if(body.password === undefined || body.password.length < 3) {
    return response.status(400).json({ error: 'password required' })
  }

  /** Username validation */
  const users = await User.find({})
  const usernames = users.map(user => user.username)
  if(body.username === undefined || usernames.includes(body.username)) {
    return response.status(400).json({ error: 'unique username required' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const user = new User ({
    username: body.username,
    user: body.user,
    passwordHash
  })

  const savedUser = await user.save()

  response.json(savedUser)
})

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({}).populate('blogs', { url : 1, title : 1, author : 1 })
  response.json(users)
})

module.exports = usersRouter