import mongoose from 'mongoose';

async function connect(): Promise<void> {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connect successfully!!!');
  } catch (error) {
    console.log('Connect failure!!!', error);
  }
}

export { connect };