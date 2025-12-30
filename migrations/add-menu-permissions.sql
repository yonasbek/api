-- Add Menu Permissions for Role Management
-- These permissions control menu visibility

-- Dashboard
INSERT INTO permissions (id, name, description, module, action, resource, "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'View Dashboard', 'Access to dashboard page', 'Dashboard', 'view', 'dashboard', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Annual Plans
INSERT INTO permissions (id, name, description, module, action, resource, "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'View Plans', 'Access to annual plans menu', 'Annual Plans', 'view', 'plans', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- My Tasks
INSERT INTO permissions (id, name, description, module, action, resource, "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'View Tasks', 'Access to my tasks page', 'My Tasks', 'view', 'tasks', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Budget
INSERT INTO permissions (id, name, description, module, action, resource, "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'View Budget', 'Access to budget page', 'Budget', 'view', 'budget', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Flagship Activities
INSERT INTO permissions (id, name, description, module, action, resource, "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'View Flagship Activities', 'Access to flagship activities page', 'Flagship Activities', 'view', 'flagship-activities', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Info Desk
INSERT INTO permissions (id, name, description, module, action, resource, "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'View Info Desk', 'Access to info desk dashboard', 'Info Desk', 'view', 'info-desk', NOW(), NOW()),
  (gen_random_uuid(), 'View Ambulance Reports', 'Access to ambulance reports', 'Info Desk', 'view', 'ambulance', NOW(), NOW()),
  (gen_random_uuid(), 'View Medical Service Reports', 'Access to medical service reports', 'Info Desk', 'view', 'medical-service', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Knowledge Base
INSERT INTO permissions (id, name, description, module, action, resource, "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'View Documents', 'Access to knowledge base documents', 'Knowledge Base', 'view', 'documents', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Memos
INSERT INTO permissions (id, name, description, module, action, resource, "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'View Memos', 'Access to memos and proposals', 'Memos', 'view', 'memos', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Attendance
INSERT INTO permissions (id, name, description, module, action, resource, "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'View Attendance', 'Access to attendance management', 'Attendance', 'view', 'attendance', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Rooms
INSERT INTO permissions (id, name, description, module, action, resource, "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'View Rooms', 'Access to meeting rooms', 'Rooms', 'view', 'rooms', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Contacts
INSERT INTO permissions (id, name, description, module, action, resource, "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'View Contacts', 'Access to contacts directory', 'Contacts', 'view', 'contacts', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Training
INSERT INTO permissions (id, name, description, module, action, resource, "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'View Trainings', 'Access to training management', 'Training', 'view', 'training', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Users
INSERT INTO permissions (id, name, description, module, action, resource, "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'View Users', 'Access to user management', 'Users', 'view', 'users', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Role Management
INSERT INTO permissions (id, name, description, module, action, resource, "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'View Roles', 'Access to role management', 'Role Management', 'view', 'roles', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Data Import
INSERT INTO permissions (id, name, description, module, action, resource, "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'View Imports', 'Access to data import', 'Data Import', 'view', 'import', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Reports
INSERT INTO permissions (id, name, description, module, action, resource, "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'View Reports', 'Access to reports', 'Reports', 'view', 'reports', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

