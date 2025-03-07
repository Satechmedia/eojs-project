// lib/utils/validators.js
/**
 * Validates an email address
 * @param {string} email - Email to validate
 * @returns {boolean} Whether the email is valid
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Validates a password meets minimum requirements
   * @param {string} password - Password to validate
   * @param {Object} options - Validation options
   * @returns {boolean} Whether the password is valid
   */
  export const isValidPassword = (password, options = {}) => {
    const { 
      minLength = 8, 
      requireUppercase = true,
      requireLowercase = true,
      requireNumbers = true,
      requireSpecialChars = true
    } = options;
    
    if (!password || password.length < minLength) {
      return false;
    }
    
    if (requireUppercase && !/[A-Z]/.test(password)) {
      return false;
    }
    
    if (requireLowercase && !/[a-z]/.test(password)) {
      return false;
    }
    
    if (requireNumbers && !/[0-9]/.test(password)) {
      return false;
    }
    
    if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return false;
    }
    
    return true;
  };
  
  /**
   * Validates a MongoDB ObjectId
   * @param {string} id - ID to validate
   * @returns {boolean} Whether the ID is valid
   */
  export const isValidObjectId = (id) => {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id);
  };
  
  /**
   * Validates a URL
   * @param {string} url - URL to validate
   * @returns {boolean} Whether the URL is valid
   */
  export const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  /**
   * Validates a date string
   * @param {string} dateStr - Date string to validate
   * @returns {boolean} Whether the date is valid
   */
  export const isValidDate = (dateStr) => {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  };
  
  /**
   * Validates required fields in an object
   * @param {Object} data - Object to validate
   * @param {Array<string>} requiredFields - List of required field names
   * @returns {Array<string>} List of missing field names
   */
  export const validateRequiredFields = (data, requiredFields) => {
    const missingFields = [];
    
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        missingFields.push(field);
      }
    }
    
    return missingFields;
  };
  
  /**
   * Creates a validator middleware for Express
   * @param {Function} validationFn - Validation function
   * @returns {Function} Express middleware
   */
  export const createValidator = (validationFn) => {
    return (req, res, next) => {
      const { error, value } = validationFn(req.body);
      
      if (error) {
        return res.status(400).json({
          error: {
            status: 400,
            message: 'Validation error',
            details: error.details.map(detail => detail.message)
          }
        });
      }
      
      // Replace req.body with validated value
      req.body = value;
      next();
    };
  };
  
  export default {
    isValidEmail,
    isValidPassword,
    isValidObjectId,
    isValidUrl,
    isValidDate,
    validateRequiredFields,
    createValidator
  };