const mongoose = require('mongoose')
const { mongoPath } = require('./config.js')

module.exports = async () => {
  await mongoose.connect(mongoPath, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  return mongoose
}