// lib/core/server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import passport from 'passport';
import logger from './logger.js';

class Server {
  constructor(config = {}) {
    this.config = {
      port: process.env.PORT || 3000,
      corsOptions: {},
      helmetOptions: {},
      ...config
    };
    
    this.app = express();
    this.setupMiddleware();
  }

  setupMiddleware() {
    // Basic middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors(this.config.corsOptions));
    this.app.use(helmet(this.config.helmetOptions));
    this.app.use(compression());
    
    // Logging middleware
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.url}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      next();
    });
    
    // Initialize passport
    this.app.use(passport.initialize());
    
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({ status: 'ok', timestamp: new Date() });
    });
  }

  registerRoutes(routes) {
    if (Array.isArray(routes)) {
      routes.forEach(route => {
        const { path, router } = route;
        this.app.use(path, router);
      });
    } else {
      Object.entries(routes).forEach(([path, router]) => {
        this.app.use(path, router);
      });
    }
    
    return this;
  }
  
  setupErrorHandler(errorHandler) {
    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        error: {
          status: 404,
          message: `Not found - ${req.originalUrl}`
        }
      });
    });
    
    // Error handler should be last
    this.app.use(errorHandler);
    
    return this;
  }

  start() {
    return new Promise((resolve) => {
      const server = this.app.listen(this.config.port, () => {
        logger.info(`Server running on port ${this.config.port}`);
        resolve(server);
      });
    });
  }
}

export default Server;