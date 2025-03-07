// lib/core/auth.js
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import logger from './logger.js';

class Auth {
  constructor(config) {
    this.config = config;
    this.User = null; // Will be set during initialization
  }

  init(User) {
    this.User = User;
    this.setupJwtStrategy();
    this.setupLocalStrategy();
    return passport;
  }

  setupJwtStrategy() {
    const options = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: this.config.jwtSecret
    };

    passport.use(new JwtStrategy(options, async (payload, done) => {
      try {
        const user = await this.User.findById(payload.sub);
        
        if (!user) {
          return done(null, false);
        }
        
        return done(null, user);
      } catch (error) {
        logger.error(`JWT authentication error: ${error.message}`);
        return done(error, false);
      }
    }));
  }

  setupLocalStrategy() {
    passport.use(new LocalStrategy({
      usernameField: 'email'
    }, async (email, password, done) => {
      try {
        const user = await this.User.findOne({ email });
        
        if (!user) {
          return done(null, false, { message: 'User not found' });
        }
        
        const isMatch = await user.comparePassword(password);
        
        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password' });
        }
        
        return done(null, user);
      } catch (error) {
        logger.error(`Local authentication error: ${error.message}`);
        return done(error);
      }
    }));
  }
  
  // Helper functions for token generation, etc.
  async generateToken(user) {
    const jwt = await import('jsonwebtoken');
    
    const payload = {
      sub: user._id,
      iat: Date.now(),
      role: user.role
    };
    
    return jwt.sign(payload, this.config.jwtSecret, {
      expiresIn: this.config.jwtExpiration || '1d'
    });
  }
}

export default Auth;