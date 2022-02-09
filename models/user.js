const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  username: {
    required: true,
    type: String
  },
  user: {
    required: true,
    type: String,
    minlenght: 3
  },
  passwordHash: {
    type: String,
    required: true
  },
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User