// Define roles and their permissions
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user'
};

// Define permissions for each role
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    // User management
    'read:users',
    'create:users',
    'update:users',
    'delete:users',

    // Order management
    'read:orders',
    'update:order_status',
    'delete:orders',

    // Product management
    'read:products',
    'create:products',
    'update:products',
    'delete:products',

    // Category management
    'read:categories',
    'create:categories',
    'update:categories',
    'delete:categories',

    // System management
    'read:system_logs',
    'update:system_settings'
  ],

  [ROLES.MANAGER]: [
    // Order management
    'read:orders',
    'update:order_status',

    // Product management
    'read:products',
    'create:products',
    'update:products',

    // Category management
    'read:categories',
    'create:categories',
    'update:categories',

    // Order history
    'update:order_history'
  ],

  [ROLES.USER]: [
    // Own resources
    'read:own_profile',
    'update:own_profile',
    'read:own_orders',
    'create:own_orders',
    'update:own_orders',
    'read:own_cart',
    'update:own_cart',

    // Public resources
    'read:products',
    'read:categories'
  ]
};

// Helper function to check if a role has a specific permission
export const hasPermission = (userRole, permission) => {
  if (!userRole || !permission) return false;

  const userPermissions = ROLE_PERMISSIONS[userRole] || [];
  return userPermissions.includes(permission);
};
