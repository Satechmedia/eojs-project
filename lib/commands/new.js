// lib/commands/new.js
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Utility functions for directory operations
const copyDirectorySync = (src, dest) => {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest);
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectorySync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

const replaceInFiles = (directory, searchValue, replaceValue) => {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    
    if (entry.isDirectory()) {
      replaceInFiles(fullPath, searchValue, replaceValue);
    } else {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes(searchValue)) {
        content = content.replace(new RegExp(searchValue, 'g'), replaceValue);
        fs.writeFileSync(fullPath, content);
      }
    }
  }
};

const newCommand = function(appName, options) {
  console.log(chalk.blue(`Creating new EOJS application: ${appName}`));
  
  // Create app directory
  fs.mkdirSync(appName);
  
  // Copy template files from lib/templates/app
  const templateDir = path.join(__dirname, '../templates/app');
  const destinationDir = path.join(process.cwd(), appName);
  
  copyDirectorySync(templateDir, destinationDir);
  
  // Replace placeholders in template files
  replaceInFiles(destinationDir, '{{APP_NAME}}', appName);
  
  // Initialize npm and install dependencies
  if (!options.skipInstall) {
    console.log(chalk.blue('Installing dependencies...'));
    execSync('npm init -y', { cwd: destinationDir });
    execSync('npm install express mongoose passport passport-jwt winston swagger-jsdoc swagger-ui-express dotenv bcrypt jsonwebtoken', { cwd: destinationDir });
    execSync('npm install --save-dev nodemon', { cwd: destinationDir });
  }
  
  console.log(chalk.green(`
✅ EOJS application ${appName} created successfully!
  
To get started:
  cd ${appName}
  npm start
  `));
};

export default newCommand;