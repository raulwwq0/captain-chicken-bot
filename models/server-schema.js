import mongoose from 'mongoose';

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

export default mongoose.model('server-channels', serverSchema)