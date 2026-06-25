'use client';

import { RoleProtectedRoute } from '@/components/auth/auth.component.role-protected-route';
import { Role } from '@/components/auth/auth.constants.roles';
import { useAuth } from '@/components/auth/auth.context.provider';
import { RouteItems } from '@/components/dashboard/dashboard.constants.route-groups';
import { DashbaordLayout } from '@/components/dashboard/dashboard.layout';
import { AdminDashboard } from './dashboard.component.admin';
import { AgencyDashboard } from './dashboard.component.agency';
import { UserDashboard } from './dashboard.component.user';

function DashboardContent() {
  const { selectedRole } = useAuth();

  switch (selectedRole?.role) {
    case Role.ADMIN:
      return <AdminDashboard />;
    case Role.OWNER:
    case Role.MANAGER:
    case Role.MEMBER:
      return <AgencyDashboard />;
    default:
      return <UserDashboard />;
  }
}

export default function DashboardPage() {
  return (
    <RoleProtectedRoute allowedRoles={RouteItems.dashboard.roles}>
      <DashbaordLayout>
        <DashboardContent />
      </DashbaordLayout>
    </RoleProtectedRoute>
  );
}
