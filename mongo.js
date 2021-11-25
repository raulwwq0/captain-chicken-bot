import mongoose from 'mongoose';
import { mongoPath } from './config.js';

export default async () => {
  await mongoose.connect(mongoPath, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  return mongoose
}