const mongoose = require('mongoose')

const reqString = {
  type: String,
  required: true,
}

const serverSchema = mongoose.Schema({
  _id: reqString,
  destiny: {
    xurChannelId: reqString,
  }
})

module.exports = mongoose.model('server-channels', serverSchema)