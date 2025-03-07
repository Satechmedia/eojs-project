// lib/commands/generate.js
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const createFileFromTemplate = (templatePath, destPath, replacements) => {
  // Create directory if it doesn't exist
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  let content = fs.readFileSync(templatePath, 'utf8');
  
  // Replace placeholders
  for (const [key, value] of Object.entries(replacements)) {
    content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  
  fs.writeFileSync(destPath, content);
};

const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const generateCommand = function(moduleName, options) {
  console.log(chalk.blue(`Generating module: ${moduleName}`));
  
  // Check if we're in an EOJS app
  if (!fs.existsSync('./app.js') && !fs.existsSync('./src/app.js')) {
    console.error(chalk.red('Error: Not in an EOJS application directory'));
    process.exit(1);
  }
  
  // Create module files from templates
  const templateDir = path.join(__dirname, '../../templates/module');
  
  const shouldGenerateAll = !(options.controllerOnly || options.serviceOnly || options.modelOnly || options.routesOnly);
  
  // Create controller
  if (shouldGenerateAll || options.controllerOnly) {
    createFileFromTemplate(
      path.join(templateDir, 'controller.js.template'),
      `./src/controllers/${moduleName}.controller.js`,
      { 
        MODULE_NAME: moduleName, 
        MODULE_NAME_CAPITALIZED: capitalize(moduleName),
        INCLUDE_SWAGGER: options.swagger ? true : false
      }
    );
    console.log(chalk.green(`Generated controller: src/controllers/${moduleName}.controller.js`));
  }
  
  // Create service
  if (shouldGenerateAll || options.serviceOnly) {
    createFileFromTemplate(
      path.join(templateDir, 'service.js.template'),
      `./src/services/${moduleName}.service.js`,
      { MODULE_NAME: moduleName, MODULE_NAME_CAPITALIZED: capitalize(moduleName) }
    );
    console.log(chalk.green(`Generated service: src/services/${moduleName}.service.js`));
  }
  
  // Create model
  if (shouldGenerateAll || options.modelOnly) {
    createFileFromTemplate(
      path.join(templateDir, 'model.js.template'),
      `./src/models/${moduleName}.model.js`,
      { 
        MODULE_NAME: moduleName, 
        MODULE_NAME_CAPITALIZED: capitalize(moduleName),
        INCLUDE_SWAGGER: options.swagger ? true : false
      }
    );
    console.log(chalk.green(`Generated model: src/models/${moduleName}.model.js`));
  }
  
  // Create route
  if (shouldGenerateAll || options.routesOnly) {
    createFileFromTemplate(
      path.join(templateDir, 'routes.js.template'),
      `./src/routes/${moduleName}.routes.js`,
      { 
        MODULE_NAME: moduleName, 
        MODULE_NAME_CAPITALIZED: capitalize(moduleName),
        INCLUDE_SWAGGER: options.swagger ? true : false
      }
    );
    console.log(chalk.green(`Generated routes: src/routes/${moduleName}.routes.js`));
  }
  
  // Update app.js to include new route if all components or routes were generated
  if (shouldGenerateAll || options.routesOnly) {
    let appJsPath = './app.js';
    
    // Check if app.js is in src directory instead
    if (!fs.existsSync(appJsPath) && fs.existsSync('./src/app.js')) {
      appJsPath = './src/app.js';
    }
    
    let appJsContent = fs.readFileSync(appJsPath, 'utf8');
    
    // Add route import
    const routeImportLine = `import ${moduleName}Routes from './routes/${moduleName}.routes.js';`;
    if (!appJsContent.includes(routeImportLine)) {
      // Find where to inject the import
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
          '\n' + routeImportLine + 
          appJsContent.slice(lastImportLineEnd);
      } else {
        // If no imports found, add at top
        appJsContent = routeImportLine + '\n' + appJsContent;
      }
    }
    
    // Add route usage
    const routeUsageLine = `app.use('/api/${moduleName}', ${moduleName}Routes);`;
    if (!appJsContent.includes(routeUsageLine)) {
      const routeRegex = /app\.use\(['"]\//g;
      let lastRouteIndex = 0;
      let match;
      
      while ((match = routeRegex.exec(appJsContent)) !== null) {
        lastRouteIndex = match.index;
      }
      
      if (lastRouteIndex > 0) {
        const lastRouteLineEnd = appJsContent.indexOf(';', lastRouteIndex) + 1;
        appJsContent = 
          appJsContent.slice(0, lastRouteLineEnd) + 
          '\n' + routeUsageLine + 
          appJsContent.slice(lastRouteLineEnd);
      } else {
        // If no route usage found, look for appropriate place to inject
        const serverStartIndex = appJsContent.indexOf('app.listen');
        if (serverStartIndex > 0) {
          appJsContent = 
            appJsContent.slice(0, serverStartIndex) + 
            routeUsageLine + '\n\n' + 
            appJsContent.slice(serverStartIndex);
        } else {
          // Append to end if no other suitable location
          appJsContent += '\n' + routeUsageLine + '\n';
        }
      }
    }
    
    fs.writeFileSync(appJsPath, appJsContent);
    console.log(chalk.green(`Updated ${appJsPath} with new route`));
  }
  
  console.log(chalk.green(`
✅ Module "${moduleName}" generated successfully!
  `));
};

export default generateCommand;