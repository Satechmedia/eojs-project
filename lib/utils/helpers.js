// lib/utils/helpers.js
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * Ensures a directory exists, creating it if necessary
 * @param {string} dirPath - Path to the directory
 */
export const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Generates a random string
 * @param {number} length - Length of the string
 * @returns {string} Random string
 */
export const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Safely parses JSON, returning defaultValue on failure
 * @param {string} str - String to parse
 * @param {*} defaultValue - Default value to return on failure
 * @returns {*} Parsed object or default value
 */
export const safeJsonParse = (str, defaultValue = {}) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Formats a date string
 * @param {Date|string} date - Date to format
 * @param {string} format - Format string
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date);
  
  if (isNaN(d.getTime())) {
    return '';
  }
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * Converts a string to kebab-case
 * @param {string} str - String to convert
 * @returns {string} Kebab-cased string
 */
export const toKebabCase = (str) => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
};

/**
 * Converts a string to camelCase
 * @param {string} str - String to convert
 * @returns {string} Camel-cased string
 */
export const toCamelCase = (str) => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => 
      index === 0 ? letter.toLowerCase() : letter.toUpperCase()
    )
    .replace(/[\s-_]+/g, '');
};

/**
 * Capitalizes the first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Deep clones an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Removes undefined properties from an object
 * @param {Object} obj - Object to clean
 * @returns {Object} Cleaned object
 */
export const removeUndefined = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  );
};

export default {
  ensureDirectoryExists,
  generateRandomString,
  safeJsonParse,
  formatDate,
  toKebabCase,
  toCamelCase,
  capitalize,
  deepClone,
  removeUndefined
};