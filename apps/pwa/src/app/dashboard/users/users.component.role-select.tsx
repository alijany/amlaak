'use client';

import { Role, getRoleName } from '@/components/auth/auth.constants.roles';
import { Dropdown } from '@/ui/atoms/ui.dropdown';
import { useState } from 'react';
import { useUpdateUserRole } from './users.api';

const AVAILABLE_ROLES = [
    { value: Role.USER, label: getRoleName(Role.USER) },
    { value: Role.ADMIN, label: getRoleName(Role.ADMIN) },
];

interface UserRoleSelectProps {
    userId: number;
    role?: Role;
    onSuccess?: () => void;
}

export function UserRoleSelect({ userId, role, onSuccess }: UserRoleSelectProps) {
    const { submit, isLoading } = useUpdateUserRole(userId);
    const [error, setError] = useState<string | null>(null);

    const handleChange = async (value: Role | null) => {
        if (!value || value === role) return;
        setError(null);
        try {
            await submit({ role: value });
            onSuccess?.();
        } catch {
            setError('خطا در تغییر نقش کاربر');
        }
    };

    return (
        <div className="min-w-[140px]">
            <Dropdown
                items={AVAILABLE_ROLES}
                value={role}
                onChange={handleChange}
                disabled={isLoading}
                variant="outline"
                size="sm"
                placeholder="انتخاب نقش"
            />
            {error && <p className="text-rose-500 text-xs mt-1">{error}</p>}
        </div>
    );
}
