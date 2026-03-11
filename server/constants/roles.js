/**
 * Role Constants
 * Centralized role definitions to prevent string magic
 */

const ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  SCHOOL_ADMIN: 'school_admin',
  DISTRICT_ADMIN: 'district_admin',
  STATE_ADMIN: 'state_admin',
  NGO_COORDINATOR: 'ngo_coordinator'
};

const ROLE_HIERARCHY = {
  student: 0,
  teacher: 1,
  ngo_coordinator: 2,
  school_admin: 3,
  district_admin: 4,
  state_admin: 5
};

const ROLE_LABELS = {
  student: 'Student',
  teacher: 'Teacher',
  ngo_coordinator: 'NGO Coordinator',
  school_admin: 'School Administrator',
  district_admin: 'District Administrator',
  state_admin: 'State Administrator'
};

module.exports = {
  ROLES,
  ROLE_HIERARCHY,
  ROLE_LABELS
};
