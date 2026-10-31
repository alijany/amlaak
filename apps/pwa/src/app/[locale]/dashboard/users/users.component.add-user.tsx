'use client';

import { Role } from '@/components/auth/auth.constants.roles';
import { useApiErrorMessage } from '@/libs/api/api.hook.use-error-message';
import { Button, Input } from '@/ui/atoms';
import { Dropdown } from '@/ui/atoms/ui.dropdown';
import { Modal } from '@/ui/atoms/ui.modal';
import { ResultModal } from '@/ui/molecules/result-modal';
import { IconX } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useAddUser } from './users.api';

interface AddUserFormProps {
    onSuccess?: () => void;
}

export function AddUserForm({ onSuccess }: AddUserFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [phone, setPhone] = useState('');
    // const [name, setName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [role, setRole] = useState<Role | ''>('');
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);

    const { submit, isLoading, error, reset } = useAddUser();
    const t = useTranslations('dashboard');
    const tCommon = useTranslations('common');
    const errorMessage = useApiErrorMessage();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await submit({
                phone,
                // name: name || undefined,
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                role: role || undefined
            });
            setIsResultModalOpen(true);
            setPhone('');
            // setName('');
            setFirstName('');
            setLastName('');
            setRole('');
            setIsOpen(false);
            if (onSuccess) onSuccess();
        } catch {
            setIsResultModalOpen(true);
        }
    };

    // Available roles for the dropdown
    const availableRoles = [
        { value: Role.USER, label: t('users.add.regularUser') },
        { value: Role.ADMIN, label: t(`roles.${Role.ADMIN}`) }
    ];

    const handleCloseResultModal = () => {
        setIsResultModalOpen(false);
        reset();
    };

    return (
        <>
            <Button onClick={() => setIsOpen(true)}>{t('users.add.open')}</Button>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                className='lg:min-w-[500px] bg-white'
            >
                <div className="p-6 flex flex-col gap-4">
                    <div className='flex justify-between items-center'>
                        <div className='font-bold text-lg lg:text-xl text-slate-700'>
                            {t('users.add.open')}
                        </div>

                        <Button variant='outline' className='!px-2' onClick={() => setIsOpen(false)} aria-label={tCommon('close')}>
                            <IconX className='size-5' />
                        </Button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('users.add.role')}
                            </label>
                            <Dropdown
                                items={availableRoles}
                                value={role}
                                onChange={(value) => setRole(value as Role)}
                                placeholder={t('users.add.rolePlaceholder')}
                                variant="outline"
                            />
                        </div>

                        <Input
                            id="phone"
                            label={t('users.add.phone')}
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="0912-345-6789"
                            required
                        />

                        {/* <Input
                            id="name"
                            label='نام کاربر'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="نام کامل"
                        /> */}

                        <Input
                            id="firstName"
                            label={t('users.add.firstName')}
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder={t('users.add.firstNamePlaceholder')}
                        />

                        <Input
                            id="lastName"
                            label={t('users.add.lastName')}
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder={t('users.add.lastNamePlaceholder')}
                        />

                        <div className="flex gap-4 pt-4">
                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={isLoading || !phone}
                            >
                                {isLoading ? t('users.add.submitting') : t('users.add.submit')}
                            </Button>
                            <Button
                                type="button"
                                variant='ghost'
                                className="flex-1"
                                onClick={() => setIsOpen(false)}
                            >
                                {tCommon('cancel')}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>

            <ResultModal
                isOpen={isResultModalOpen}
                onClose={handleCloseResultModal}
                status={error ? 'error' : 'success'}
                title={t('users.add.resultTitle')}
                successMessage={t('users.add.success')}
                errorMessage={errorMessage(error, t('users.add.failed'))}
            />
        </>
    );
}
