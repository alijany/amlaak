'use client';

import { RoleProtectedRoute } from '@/components/auth/auth.component.role-protected-route';
import { RouteItems } from '@/components/dashboard/dashboard.constants.route-groups';


export default function DashboardPage() {
  return (
    <RoleProtectedRoute allowedRoles={RouteItems.dashboard.roles}>
      <div />
    </RoleProtectedRoute>
  );
}
