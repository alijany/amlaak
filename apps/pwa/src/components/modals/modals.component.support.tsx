"use client";

import { Button, Modal } from '@/ui/atoms';
import { IconX } from '@tabler/icons-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className='px-4 py-6 lg:px-6 bg-white lg:rounded-2xl flex flex-col gap-6 lg:min-w-[480px]'
    >
      <div className='flex justify-between items-center'>
        <div className='font-bold text-lg lg:text-xl text-slate-700'>پشتیبانی</div>
        <Button variant='outline' className='!px-2' onClick={onClose}>
          <IconX className='size-5' />
        </Button>
      </div>

      <div className='text-slate-600 text-sm'>
        برای ارتباط با پشتیبانی لطفا با ما تماس بگیرید.
      </div>

      <div className='flex justify-end'>
        <Button variant='secondary' onClick={onClose}>بستن</Button>
      </div>
    </Modal>
  );
}
