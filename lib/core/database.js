// lib/core/database.js
import mongoose from 'mongoose';
import logger from './logger.js';

class Database {
  constructor(config) {
    this.config = config;
    this.connection = null;
  }

  async connect() {
    try {
      const { uri, options } = this.config;
      
      mongoose.connection.on('connected', () => {
        logger.info('MongoDB connection established successfully');
      });
      
      mongoose.connection.on('error', (err) => {
        logger.error(`MongoDB connection error: ${err}`);
      });
      
      mongoose.connection.on('disconnected', () => {
        logger.info('MongoDB connection disconnected');
      });
      
      process.on('SIGINT', () => {
        mongoose.connection.close(() => {
          logger.info('MongoDB connection closed due to application termination');
          process.exit(0);
        });
      });
      
      this.connection = await mongoose.connect(uri, options);
      return this.connection;
    } catch (error) {
      logger.error(`Failed to connect to MongoDB: ${error.message}`);
      process.exit(1);
    }
  }
  
  async disconnect() {
    if (this.connection) {
      await mongoose.disconnect();
      this.connection = null;
      logger.info('MongoDB connection closed');
    }
  }
}

export default Database;