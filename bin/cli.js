#!/usr/bin/env node
// bin/cli.js - Main CLI entry point for EOJS

import { program } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Get package.json version using ES6 module approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const { version } = packageJson;

// Import commands
import newCommand from '../lib/commands/new.js';
import generateCommand from '../lib/commands/generate.js';
import addMiddleware from '../lib/commands/add-middleware.js';
import addRole from '../lib/commands/add-role.js';

// Display banner
console.log(
  chalk.blue(
    figlet.textSync('EOJS', { horizontalLayout: 'full' })
  )
);
console.log(chalk.blue('Express Opinionated JavaScript Framework\n'));

// Set up CLI program
program
  .version(version)
  .description('Express Opinionated JavaScript Framework CLI');

// New application command
program
  .command('new <app-name>')
  .description('Create a new EOJS application')
  .option('-d, --database <database>', 'specify database connection string', 'mongodb://localhost:27017/eojs-app')
  .option('--skip-install', 'skip npm package installation')
  .action(newCommand);

// Generate module command
program
  .command('generate <module-name>')
  .alias('g')
  .description('Generate a new module (controller, service, model, routes)')
  .option('-c, --controller-only', 'generate only controller')
  .option('-s, --service-only', 'generate only service')
  .option('-m, --model-only', 'generate only model')
  .option('-r, --routes-only', 'generate only routes')
  .option('--no-swagger', 'skip swagger documentation')
  .action(generateCommand);

// Add middlewares command
program
  .command('add:middleware <middleware-name>')
  .description('Add a middleware to the application')
  .action(addMiddleware);

// Add RBAC roles command
program
  .command('add:role <role-name>')
  .description('Add a new role to RBAC')
  .option('-p, --permissions <permissions>', 'comma-separated list of permissions')
  .action(addRole);

// Print help if no arguments provided
if (process.argv.length === 2) {
  program.help();
}

program.parse(process.argv);