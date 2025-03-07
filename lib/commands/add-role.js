// lib/commands/add-role.js
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const addRole = (roleName, options) => {
  console.log(chalk.blue(`Adding role: ${roleName}`));
  
  // Check if we're in an EOJS app
  if (!fs.existsSync('./app.js') && !fs.existsSync('./src/app.js')) {
    console.error(chalk.red('Error: Not in an EOJS application directory'));
    process.exit(1);
  }
  
  // Look for RBAC configuration file
  let rbacPath = './src/config/rbac.js';
  
  if (!fs.existsSync(rbacPath)) {
    console.error(chalk.red('Error: RBAC configuration file not found'));
    process.exit(1);
  }
  
  let rbacContent = fs.readFileSync(rbacPath, 'utf8');
  
  // Parse permissions if provided
  const permissions = options.permissions ? 
    options.permissions.split(',').map(p => p.trim()) : 
    ['read:own'];
  
  // Check if role already exists
  const roleRegex = new RegExp(`${roleName}:\\s*{`);
  if (roleRegex.test(rbacContent)) {
    console.log(chalk.yellow(`Role "${roleName}" already exists. Updating permissions...`));
    
    // Find the role and update permissions
    const roleStartIndex = rbacContent.search(roleRegex);
    const roleBlockEnd = findMatchingBrace(rbacContent, roleStartIndex);
    
    if (roleBlockEnd > roleStartIndex) {
      // Extract the role block
      const roleBlock = rbacContent.substring(roleStartIndex, roleBlockEnd + 1);
      
      // Find permissions array
      const permissionsStartIndex = roleBlock.indexOf('permissions:');
      if (permissionsStartIndex > -1) {
        const permissionsArrayStart = roleBlock.indexOf('[', permissionsStartIndex);
        const permissionsArrayEnd = roleBlock.indexOf(']', permissionsArrayStart) + 1;
        
        if (permissionsArrayStart > -1 && permissionsArrayEnd > -1) {
          // Create new permissions array
          const permissionsArray = `[${permissions.map(p => `'${p}'`).join(', ')}]`;
          
          // Replace the old permissions array
          const updatedRoleBlock = 
            roleBlock.substring(0, permissionsArrayStart) + 
            permissionsArray + 
            roleBlock.substring(permissionsArrayEnd);
          
          // Update the RBAC content
          rbacContent = 
            rbacContent.substring(0, roleStartIndex) + 
            updatedRoleBlock + 
            rbacContent.substring(roleBlockEnd + 1);
          
          fs.writeFileSync(rbacPath, rbacContent);
          console.log(chalk.green(`Updated permissions for role "${roleName}"`));
        }
      }
    }
  } else {
    // Add new role
    // Find roles object
    const rolesRegex = /roles\s*=\s*{/;
    const rolesMatch = rolesRegex.exec(rbacContent);
    
    if (rolesMatch) {
      const rolesStart = rolesMatch.index;
      const rolesBlockStart = rbacContent.indexOf('{', rolesStart);
      
      // Find the closing brace of the roles object
      const rolesBlockEnd = findMatchingBrace(rbacContent, rolesBlockStart);
      
      if (rolesBlockEnd > rolesBlockStart) {
        // Create new role object
        const newRole = `
  ${roleName}: {
    permissions: [${permissions.map(p => `'${p}'`).join(', ')}]
  },`;
        
        // Insert the new role before the closing brace
        rbacContent = 
          rbacContent.substring(0, rolesBlockEnd) + 
          newRole + 
          rbacContent.substring(rolesBlockEnd);
        
        fs.writeFileSync(rbacPath, rbacContent);
        console.log(chalk.green(`Added new role "${roleName}" with permissions: ${permissions.join(', ')}`));
      }
    } else {
      console.error(chalk.red('Error: Could not find roles object in RBAC configuration'));
      process.exit(1);
    }
  }
  
  console.log(chalk.green(`
✅ Role "${roleName}" added/updated successfully!
  `));
};

// Helper function to find matching closing brace
const findMatchingBrace = (content, openBraceIndex) => {
  let braceCount = 1;
  let index = openBraceIndex + 1;
  
  while (braceCount > 0 && index < content.length) {
    if (content[index] === '{') {
      braceCount++;
    } else if (content[index] === '}') {
      braceCount--;
    }
    
    if (braceCount === 0) {
      return index;
    }
    
    index++;
  }
  
  return -1;
};

export default addRole;