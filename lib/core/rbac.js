// lib/core/rbac.js
class RBAC {
    constructor() {
      this.roles = {
        admin: {
          permissions: ['*']
        },
        user: {
          permissions: ['read:own', 'update:own', 'delete:own']
        },
        guest: {
          permissions: ['read:public']
        }
      };
    }
  
    // Check if a role has permission for an action
    can(role, action, resource, userId, resourceOwnerId) {
      if (!this.roles[role]) {
        return false;
      }
  
      // Admin can do anything
      if (role === 'admin' || this.roles[role].permissions.includes('*')) {
        return true;
      }
  
      // Check for exact permission
      if (this.roles[role].permissions.includes(`${action}:${resource}`)) {
        return true;
      }
  
      // Check for ownership-based permission
      if (
        this.roles[role].permissions.includes(`${action}:own`) &&
        userId &&
        resourceOwnerId &&
        userId.toString() === resourceOwnerId.toString()
      ) {
        return true;
      }
  
      // Check for public access permission
      if (
        this.roles[role].permissions.includes(`${action}:public`) &&
        resource === 'public'
      ) {
        return true;
      }
  
      return false;
    }
  
    // Middleware to check permission
    checkPermission(action, resource, getOwnerId = null) {
      return async (req, res, next) => {
        try {
          // Skip for admin users
          if (req.user && req.user.role === 'admin') {
            return next();
          }
  
          const role = req.user ? req.user.role : 'guest';
          const userId = req.user ? req.user._id : null;
          
          let resourceOwnerId = null;
          if (getOwnerId) {
            resourceOwnerId = await getOwnerId(req);
          }
  
          if (this.can(role, action, resource, userId, resourceOwnerId)) {
            return next();
          } else {
            return res.status(403).json({
              error: 'Forbidden',
              message: 'You do not have permission to perform this action'
            });
          }
        } catch (error) {
          next(error);
        }
      };
    }
    
    // Add a new role
    addRole(roleName, permissions) {
      if (this.roles[roleName]) {
        this.roles[roleName].permissions = [...permissions];
      } else {
        this.roles[roleName] = {
          permissions: [...permissions]
        };
      }
      
      return this.roles[roleName];
    }
    
    // Add permissions to a role
    addPermissions(roleName, permissions) {
      if (!this.roles[roleName]) {
        throw new Error(`Role "${roleName}" does not exist`);
      }
      
      this.roles[roleName].permissions = [
        ...new Set([...this.roles[roleName].permissions, ...permissions])
      ];
      
      return this.roles[roleName];
    }
    
    // Get all roles
    getRoles() {
      return Object.keys(this.roles);
    }
    
    // Get role details
    getRole(roleName) {
      return this.roles[roleName];
    }
  }
  
  export default new RBAC();