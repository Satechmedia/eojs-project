// lib/commands/add-middleware.js
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const addMiddleware = async (middlewareName, options) => {
  console.log(chalk.blue(`Adding middleware: ${middlewareName}`));
  
  // Check if we're in an EOJS app
  if (!fs.existsSync('./app.js') && !fs.existsSync('./src/app.js')) {
    console.error(chalk.red('Error: Not in an EOJS application directory'));
    process.exit(1);
  }
  
  // Create middleware directory if it doesn't exist
  const middlewareDir = './src/middleware';
  if (!fs.existsSync(middlewareDir)) {
    fs.mkdirSync(middlewareDir, { recursive: true });
  }
  
  // Create middleware file
  const templatePath = path.join(__dirname, '../../templates/middleware/middleware.js.template');
  const destPath = path.join(middlewareDir, `${middlewareName}.js`);
  
  if (fs.existsSync(templatePath)) {
    let templateContent = fs.readFileSync(templatePath, 'utf8');
    templateContent = templateContent.replace(/\{\{MIDDLEWARE_NAME\}\}/g, middlewareName);
    
    fs.writeFileSync(destPath, templateContent);
    console.log(chalk.green(`Created middleware: ${destPath}`));
    
    // Update app.js to use the middleware
    let appJsPath = './app.js';
    
    // Check if app.js is in src directory instead
    if (!fs.existsSync(appJsPath) && fs.existsSync('./src/app.js')) {
      appJsPath = './src/app.js';
    }
    
    let appJsContent = fs.readFileSync(appJsPath, 'utf8');
    
    // Add middleware import
    const importLine = `import ${middlewareName}Middleware from './middleware/${middlewareName}.js';`;
    if (!appJsContent.includes(importLine)) {
      const importRegex = /import.*from/g;
      let lastImportIndex = 0;
      let match;
      
      while ((match = importRegex.exec(appJsContent)) !== null) {
        lastImportIndex = match.index;
      }
      
      if (lastImportIndex > 0) {
        const lastImportLineEnd = appJsContent.indexOf(';', lastImportIndex) + 1;
        appJsContent = 
          appJsContent.slice(0, lastImportLineEnd) + 
          '\n' + importLine + 
          appJsContent.slice(lastImportLineEnd);
      } else {
        // If no imports found, add at top
        appJsContent = importLine + '\n' + appJsContent;
      }
    }
    
    // Add middleware usage - look for app.use statements
    const middlewareUsage = `app.use(${middlewareName}Middleware);`;
    if (!appJsContent.includes(middlewareUsage)) {
      // Find a good spot to add the middleware - typically after other app.use statements
      // but before routes
      const middlewareRegex = /app\.use\([^\/]/;
      const match = middlewareRegex.exec(appJsContent);
      
      if (match) {
        const lastMiddlewareLineEnd = appJsContent.indexOf(';', match.index) + 1;
        appJsContent = 
          appJsContent.slice(0, lastMiddlewareLineEnd) + 
          '\n' + middlewareUsage + 
          appJsContent.slice(lastMiddlewareLineEnd);
      } else {
        // If no middleware found, look for the first route
        const routeRegex = /app\.use\(['"]\//;
        const routeMatch = routeRegex.exec(appJsContent);
        
        if (routeMatch) {
          appJsContent = 
            appJsContent.slice(0, routeMatch.index) + 
            middlewareUsage + '\n\n' + 
            appJsContent.slice(routeMatch.index);
        } else {
          // Append after express setup
          const expressRegex = /app\.use\(express/;
          const expressMatch = expressRegex.exec(appJsContent);
          
          if (expressMatch) {
            const expressLineEnd = appJsContent.indexOf(';', expressMatch.index) + 1;
            appJsContent = 
              appJsContent.slice(0, expressLineEnd) + 
              '\n' + middlewareUsage + 
              appJsContent.slice(expressLineEnd);
          } else {
            // Just append near the beginning after app is defined
            const appDefRegex = /const app =/;
            const appDefMatch = appDefRegex.exec(appJsContent);
            
            if (appDefMatch) {
              const appDefLineEnd = appJsContent.indexOf(';', appDefMatch.index) + 1;
              appJsContent = 
                appJsContent.slice(0, appDefLineEnd) + 
                '\n\n' + middlewareUsage + 
                appJsContent.slice(appDefLineEnd);
            }
          }
        }
      }
      
      fs.writeFileSync(appJsPath, appJsContent);
      console.log(chalk.green(`Updated ${appJsPath} to use the middleware`));
    }
  } else {
    console.error(chalk.red(`Middleware template not found: ${templatePath}`));
    process.exit(1);
  }
  
  console.log(chalk.green(`
✅ Middleware "${middlewareName}" added successfully!
  `));
};

export default addMiddleware;