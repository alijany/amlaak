"use client";

import { Button, Modal } from '@/ui/atoms';
import { IconX } from '@tabler/icons-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className='px-4 py-6 lg:px-6 bg-white lg:rounded-2xl flex flex-col gap-6 lg:min-w-[768px] max-h-[80vh] overflow-y-auto'
    >
      <div className='flex justify-between items-center'>
        <div className='font-bold text-lg lg:text-xl text-slate-700'>
          قوانین و مقررات سایت
        </div>

        <Button variant='outline' className='!px-2' onClick={onClose}>
          <IconX className='size-5' />
        </Button>
      </div>

      <div className='space-y-4 text-slate-700 text-sm lg:text-base'>
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div>
            <p className="mt-4 text-lg text-gray-600">
              آخرین به‌روزرسانی: 1403/06/15
            </p>
          </div>

          <div className="mt-12 text-gray-700 space-y-8 text-right" dir="rtl">
          </div>

        </div>
      </div>

      <div className='flex justify-end'>
        <Button variant='secondary' onClick={onClose}>
          قبول دارم
        </Button>
      </div>
    </Modal>
  );
}