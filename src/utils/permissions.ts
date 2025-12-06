// src/utils/permissions.ts
/**
 * Role-based permissions for Daily Work Status module
 */

export type SystemRole = 'Super Admin' | 'Admin' | 'Manager' | 'Engineer' | null;

export interface PermissionContext {
  userRole: SystemRole;
  userId: string;
  userReportsTo?: string;
}

/**
 * Check if user can view all entries (Super Admin/Admin/Manager view)
 */
export const canViewAllEntries = (role: SystemRole): boolean => {
  return role === 'Super Admin' || role === 'Admin' || role === 'Manager';
};

/**
 * Check if user can edit entry
 * - Super Admin/Admin can edit all
 * - Managers can edit their team's entries
 * - Engineers can only edit their own entries
 */
export const canEditEntry = (
  userRole: SystemRole,
  userId: string,
  entryCreatedBy: string,
  entryAssignedTo: string,
  personnel: any[]
): boolean => {
  // Super Admin and Admin can edit everything
  if (userRole === 'Super Admin' || userRole === 'Admin') return true;

  // User can edit their own entries
  if (entryCreatedBy === userId) return true;

  // Manager can edit entries of people who report to them
  if (userRole === 'Manager') {
    const assignedPerson = personnel.find(p => p.name === entryAssignedTo);
    if (assignedPerson?.reportsTo === userId) return true;
  }

  return false;
};

/**
 * Check if user can delete entry
 * - Super Admin and Admin can delete all
 * - Managers can delete entries they created
 */
export const canDeleteEntry = (
  userRole: SystemRole,
  userId: string,
  entryCreatedBy: string,
  personnel: any[]
): boolean => {
  if (userRole === 'Super Admin' || userRole === 'Admin') return true;
  
  if (userRole === 'Manager') {
    // Manager can delete entries they created
    return entryCreatedBy === userId;
  }

  return false;
};

/**
 * Check if user can access Master Data
 * - Only Super Admin and Admin can manage master data
 */
export const canAccessMasterData = (role: SystemRole): boolean => {
  return role === 'Super Admin' || role === 'Admin';
};

/**
 * Check if user can manage system settings (roles, departments)
 * - Only Super Admin can manage system-level settings
 */
export const canManageSystemSettings = (role: SystemRole): boolean => {
  return role === 'Super Admin';
};

/**
 * Check if user can access Reports
 * - Super Admin/Admin see all reports
 * - Managers see their team's reports
 * - Engineers see only their own data
 */
export const canAccessReports = (role: SystemRole): boolean => {
  return role === 'Admin' || role === 'Manager' || role === 'Engineer';
};

/**
 * Check if user can configure reminder settings
 * - Only Admins can configure system settings
 */
export const canConfigureSettings = (role: SystemRole): boolean => {
  return role === 'Admin';
};

/**
 * Filter entries based on user role
 */
export const filterEntriesByPermission = (
  entries: any[],
  userRole: SystemRole,
  userId: string,
  userName: string,
  personnel: any[]
): any[] => {
  // Admin sees everything
  if (userRole === 'Admin') return entries;

  // Manager sees their team's entries
  if (userRole === 'Manager') {
    const teamMembers = personnel
      .filter(p => p.reportsTo === userId)
      .map(p => p.name);
    
    return entries.filter(entry => 
      entry.assignedTo === userName || 
      teamMembers.includes(entry.assignedTo) ||
      entry.createdBy === userId
    );
  }

  // Engineer sees only their own entries
  return entries.filter(entry => 
    entry.assignedTo === userName || entry.createdBy === userId
  );
};

/**
 * Get user's system role from personnel data
 */
export const getUserRole = (
  userId: string,
  personnel: any[]
): SystemRole => {
  const user = personnel.find(p => p.id === userId || p.email === userId);
  return user?.systemRole || null;
};

/**
 * Get user's full profile
 */
export const getUserProfile = (
  userId: string,
  personnel: any[]
) => {
  return personnel.find(p => p.id === userId || p.email === userId);
};
