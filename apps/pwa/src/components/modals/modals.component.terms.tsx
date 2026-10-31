"use client";

import { Button, Modal } from '@/ui/atoms';
import { IconX } from '@tabler/icons-react';
import { useFormatter, useTranslations } from 'next-intl';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * One instant, rendered in the reader's calendar — `۱۵ شهریور ۱۴۰۳` under `fa`,
 * `September 5, 2024` under `en` — so no date is tracked per language.
 */
const TERMS_UPDATED_AT = new Date('2024-09-05T12:00:00Z');

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
  const t = useTranslations('common.terms');
  const tCommon = useTranslations('common');
  const format = useFormatter();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className='px-4 py-6 lg:px-6 bg-white lg:rounded-2xl flex flex-col gap-6 lg:min-w-[768px] max-h-[80vh] overflow-y-auto'
    >
      <div className='flex justify-between items-center'>
        <div className='font-bold text-lg lg:text-xl text-slate-700'>
          {t('title')}
        </div>

        <Button variant='outline' className='!px-2' onClick={onClose} aria-label={tCommon('close')}>
          <IconX className='size-5' />
        </Button>
      </div>

      <div className='space-y-4 text-slate-700 text-sm lg:text-base'>
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div>
            <p className="mt-4 text-lg text-gray-600">
              {t('updatedAt', { date: format.dateTime(TERMS_UPDATED_AT, 'full') })}
            </p>
          </div>

          <div className="mt-12 text-gray-700 space-y-8 text-start">
          </div>

        </div>
      </div>

      <div className='flex justify-end'>
        <Button variant='secondary' onClick={onClose}>
          {t('accept')}
        </Button>
      </div>
    </Modal>
  );
}
