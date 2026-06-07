CREATE TEMP TABLE "_PermissionCatalog" (
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "module" TEXT NOT NULL,
  "description" TEXT NOT NULL
) ON COMMIT DROP;

INSERT INTO "_PermissionCatalog" ("code", "name", "module", "description") VALUES
('section.dashboard.dashboard.view', 'View Dashboard', 'Dashboard', 'Access Dashboard under Dashboard.'),
('section.tickets.service.requests.view', 'View Service Requests', 'Tickets', 'Access Service Requests under Tickets.'),
('section.tickets.work.orders.view', 'View Work Orders', 'Tickets', 'Access Work Orders under Tickets.'),
('section.tickets.job.plans.view', 'View Job Plans', 'Tickets', 'Access Job Plans under Tickets.'),
('section.tickets.ppm.planner.view', 'View PPM Planner', 'Tickets', 'Access PPM Planner under Tickets.'),
('section.facility.bookings.facility.report.view', 'View Facility Report', 'Facility Bookings', 'Access Facility Report under Facility Bookings.'),
('section.facility.bookings.locations.view', 'View Locations', 'Facility Bookings', 'Access Locations under Facility Bookings.'),
('section.facility.bookings.bookings.report.view', 'View Bookings Report', 'Facility Bookings', 'Access Bookings Report under Facility Bookings.'),
('section.housing.operations.housing.dashboard.view', 'View Housing Dashboard', 'Housing Operations', 'Access Housing Dashboard under Housing Operations.'),
('section.housing.operations.accommodation.and.bookings.view', 'View Accommodation & Bookings', 'Housing Operations', 'Access Accommodation & Bookings under Housing Operations.'),
('section.housing.operations.room.inspections.view', 'View Room Inspections', 'Housing Operations', 'Access Room Inspections under Housing Operations.'),
('section.housing.operations.housing.assets.view', 'View Housing Assets', 'Housing Operations', 'Access Housing Assets under Housing Operations.'),
('section.housing.operations.housing.inventory.view', 'View Housing Inventory', 'Housing Operations', 'Access Housing Inventory under Housing Operations.'),
('section.housing.operations.approvals.and.alerts.view', 'View Approvals & Alerts', 'Housing Operations', 'Access Approvals & Alerts under Housing Operations.'),
('section.housing.operations.notification.settings.view', 'View Notification Settings', 'Housing Operations', 'Access Notification Settings under Housing Operations.'),
('section.housing.operations.housing.reports.view', 'View Housing Reports', 'Housing Operations', 'Access Housing Reports under Housing Operations.'),
('section.assets.management.assets.management.view', 'View Assets Management', 'Assets Management', 'Access Assets Management under Assets Management.'),
('section.assets.management.bulk.upload.assets.view', 'View Bulk Upload Assets', 'Assets Management', 'Access Bulk Upload Assets under Assets Management.'),
('section.assets.management.asset.inventory.allocation.view', 'View Asset Inventory Allocation', 'Assets Management', 'Access Asset Inventory Allocation under Assets Management.'),
('section.inventory.management.inventory.view', 'View Inventory', 'Inventory Management', 'Access Inventory under Inventory Management.'),
('section.inventory.management.bulk.upload.inventory.view', 'View Bulk Upload Inventory', 'Inventory Management', 'Access Bulk Upload Inventory under Inventory Management.'),
('section.inventory.management.inventory.reports.view', 'View Inventory Reports', 'Inventory Management', 'Access Inventory Reports under Inventory Management.'),
('section.safety.hse.view', 'View HSE', 'Safety', 'Access HSE under Safety.'),
('section.safety.iot.bms.view', 'View IoT / BMS', 'Safety', 'Access IoT / BMS under Safety.'),
('section.compliance.and.certification.compliance.dashboard.view', 'View Compliance Dashboard', 'Compliance & Certification', 'Access Compliance Dashboard under Compliance & Certification.'),
('section.compliance.and.certification.certification.register.view', 'View Certification Register', 'Compliance & Certification', 'Access Certification Register under Compliance & Certification.'),
('section.compliance.and.certification.non.compliance.management.view', 'View Non-Compliance Management', 'Compliance & Certification', 'Access Non-Compliance Management under Compliance & Certification.'),
('section.compliance.and.certification.audit.calendar.view', 'View Audit Calendar', 'Compliance & Certification', 'Access Audit Calendar under Compliance & Certification.'),
('section.compliance.and.certification.expiry.alerts.view', 'View Expiry Alerts', 'Compliance & Certification', 'Access Expiry Alerts under Compliance & Certification.'),
('section.document.management.operation.and.maintenance.manuals.view', 'View Operation & Maintenance Manuals', 'Document Management', 'Access Operation & Maintenance Manuals under Document Management.'),
('section.document.management.equipment.warranties.and.guarantees.view', 'View Equipment Warranties and Guarantees', 'Document Management', 'Access Equipment Warranties and Guarantees under Document Management.'),
('section.document.management.support.contracts.and.slas.view', 'View Support Contracts and SLAs', 'Document Management', 'Access Support Contracts and SLAs under Document Management.'),
('section.incident.and.case.management.incident.and.case.management.view', 'View Incident & Case Management', 'Incident & Case Management', 'Access Incident & Case Management under Incident & Case Management.'),
('section.resource.management.employees.view', 'View Employees', 'Resource Management', 'Access Employees under Resource Management.'),
('section.resource.management.shifts.and.rotations.view', 'View Shifts & Rotations', 'Resource Management', 'Access Shifts & Rotations under Resource Management.'),
('section.resource.management.time.sheets.view', 'View Time Sheets', 'Resource Management', 'Access Time Sheets under Resource Management.'),
('section.resource.management.roles.and.permissions.view', 'View Roles & Permissions', 'Resource Management', 'Access Roles & Permissions under Resource Management.'),
('section.services.department.codes.view', 'View Department Codes', 'Services', 'Access Department Codes under Services.'),
('section.services.create.team.code.view', 'View Create Team Code', 'Services', 'Access Create Team Code under Services.'),
('section.services.service.teams.view', 'View Service Teams', 'Services', 'Access Service Teams under Services.'),
('section.services.services.catalog.view', 'View Services Catalog', 'Services', 'Access Services Catalog under Services.'),
('section.services.bulk.upload.services.view', 'View Bulk Upload Services', 'Services', 'Access Bulk Upload Services under Services.'),
('section.users.management.users.management.view', 'View Users Management', 'Users Management', 'Access Users Management under Users Management.'),
('section.users.management.permissions.view', 'View Permissions', 'Users Management', 'Access Permissions under Users Management.'),
('section.utilities.bulk.upload.center.view', 'View Bulk Upload Center', 'Utilities', 'Access Bulk Upload Center under Utilities.'),
('section.utilities.bulk.upload.templates.view', 'View Bulk Upload Templates', 'Utilities', 'Access Bulk Upload Templates under Utilities.'),
('section.utilities.csv.excel.pdf.reports.view', 'View CSV / Excel / PDF Reports', 'Utilities', 'Access CSV / Excel / PDF Reports under Utilities.'),
('section.activity.logs.audit.logs.view', 'View Audit Logs', 'Activity Logs', 'Access Audit Logs under Activity Logs.'),
('section.activity.logs.reports.preview.view', 'View Reports Preview', 'Activity Logs', 'Access Reports Preview under Activity Logs.'),
('assets.manage', 'Manage Assets', 'Assets Management', 'Create, edit, import and view asset history'),
('work.manage', 'Manage Work Orders', 'Tickets', 'Create and update work orders'),
('work.execute', 'Execute Work Orders', 'Tickets', 'Update status, time, photos, assets and inventory used'),
('requests.manage', 'Manage Service Requests', 'Tickets', 'Create, edit, assign and convert requests to work orders'),
('requests.approve', 'Approve or Reject Requests', 'Tickets', 'Supervisor/helpdesk review, validate, approve or reject service requests'),
('requests.view', 'View Service Requests', 'Tickets', 'View assigned service requests'),
('work.assign', 'Assign Work Orders', 'Tickets', 'Assign work orders to technicians or teams'),
('work.verify', 'Verify Completed Work', 'Tickets', 'Approve, reject, reopen or close completed work'),
('ppm.manage', 'Manage PPM', 'Tickets', 'Create planned preventive maintenance schedules'),
('users.manage', 'Manage Users', 'Users Management', 'Create users and assign roles'),
('roles.manage', 'Manage Roles', 'Users Management', 'Create custom roles and permission sets'),
('reports.view', 'View Reports', 'Utilities', 'Preview and download reports'),
('assets.view', 'View Assets', 'Assets Management', 'View asset register, history and location drill-down'),
('work.view', 'View Work Orders', 'Tickets', 'View work order panels and completion history'),
('reception.manage', 'Reception Desk', 'Reception', 'Create resident requests and view front-desk queue'),
('resident.portal', 'Resident Portal', 'Resident', 'Create and track own requests'),
('housing.manage', 'Manage Housing Operations', 'Housing Operations', 'Create and manage accommodation, bookings, inspections, assets and inventory'),
('housing.approve', 'Approve Housing Requests', 'Housing Operations', 'Approve or reject housing bookings and escalations'),
('housing.view', 'View Housing', 'Housing Operations', 'View housing dashboards, room history, reports and alerts'),
('compliance.manage', 'Manage Compliance & Certification', 'Compliance & Certification', 'Create and renew statutory certificates, permits and regulatory audits'),
('compliance.view', 'View Compliance & Certification', 'Compliance & Certification', 'View compliance dashboard, certificate register, expiry alerts and reports'),
('documents.upload', 'Upload Document Files', 'Document Management', 'Upload files to document management folders. Admin only.');

INSERT INTO "Permission" ("id", "code", "name", "module", "description")
SELECT concat('perm-', regexp_replace("code", '[^a-z0-9]+', '-', 'g')), "code", "name", "module", "description"
FROM "_PermissionCatalog"
ON CONFLICT ("code") DO UPDATE SET
  "name" = EXCLUDED."name",
  "module" = EXCLUDED."module",
  "description" = EXCLUDED."description";

INSERT INTO "RolePermission" ("id", "role", "permissionId")
SELECT concat('rp-admin-', p."id"), 'Admin', p."id"
FROM "Permission" p
WHERE p."code" IN (SELECT "code" FROM "_PermissionCatalog")
ON CONFLICT ("role", "permissionId") DO NOTHING;

DELETE FROM "RolePermission" rp
USING "Permission" p
WHERE rp."permissionId" = p."id"
  AND p."code" = 'documents.upload'
  AND rp."role" <> 'Admin';
