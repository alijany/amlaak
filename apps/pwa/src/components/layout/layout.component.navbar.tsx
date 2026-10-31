"use client";

import { brand } from '@/config/brand.config';
import { Button } from '@/ui/atoms';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { IconCancel, IconMenu, IconPhone, IconRocket, IconUser } from '@tabler/icons-react';
import { Link } from '@/i18n/i18n.navigation';
import { useTranslations } from 'next-intl';
import { Fragment, useState } from 'react';
import { useAuth } from '../auth/auth.context.provider';
import { MenuItems } from "./layout.component.menu-items";

export function Navbar({ transparent }: { transparent?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');

  return (
    <>
      <div className="z-30 sticky top-4 m-4 lg:top-6">
        <nav
          className={`max-w-7xl mx-auto flex justify-between items-center rounded-2xl p-3 lg:p-4 border transition-all duration-300 ${transparent
            ? 'bg-white/10 backdrop-blur-xl border-white/40 shadow-lg shadow-black/10'
            : 'bg-white/80 backdrop-blur-xl border-white shadow-2xl shadow-black/10'
            }`}
        >
          <div className="flex items-center gap-3">
            <Button
              className="lg:hidden visible p-2"
              variant="outline"
              size="lg"
              onClick={() => setIsOpen(true)}
              aria-label={tCommon('openMenu')}
            >
              <IconMenu className="size-4" />
            </Button>
            <Link href='/' className="flex items-center gap-2">
              <img src="/images/logo.svg" alt="Logo" className="h-6 lg:h-8" />
              <h1 className="text-base lg:text-lg font-bold text-slate-800">{tCommon('brand')}</h1>
            </Link>
          </div>

          <MenuItems onClose={() => setIsOpen(false)} className="lg:flex gap-6 hidden" />

          <div className='flex gap-2 items-center'>
            {!isAuthenticated && (
              <>
                <Link className="block" href="/login">
                  <Button variant="primary" size="md" className="flex gap-2 text-white shadow-md shadow-blue-500/20">
                    <div className='text-sm hidden lg:block'>{t('startFree')}</div>
                    <IconRocket size={18} />
                  </Button>
                </Link>
              </>
            )}
            {isAuthenticated && (
              <Link className="block" href="/dashboard">
                <Button variant="secondary" className="flex gap-3">
                  <div className='text-sm hidden lg:block'>{t('dashboard')}</div>
                  <IconUser size={20} />
                </Button>
              </Link>
            )}
          </div>
        </nav>
      </div>

      <Transition show={isOpen} as={Fragment}>
        <Dialog onClose={() => setIsOpen(false)} className="relative z-50">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 backdrop-blur bg-black/30" />
          </TransitionChild>

          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="ltr:-translate-x-full rtl:translate-x-full"
            enterTo="translate-x-0"
            leave="ease-in duration-200"
            leaveFrom="translate-x-0"
            leaveTo="ltr:-translate-x-full rtl:translate-x-full"
          >
            <DialogPanel className="fixed inset-y-0 start-0 w-[80%] max-w-sm bg-white shadow-xl p-6">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                  <img src="/images/logo.svg" alt="Logo" className="h-5" />
                  <h1 className="text-xl font-bold text-slate-900">{tCommon('brand')}</h1>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className='p-2'
                  onClick={() => setIsOpen(false)}
                  aria-label={tCommon('close')}
                >
                  <IconCancel className="size-4" />
                </Button>
              </div>

              <MenuItems
                className="flex flex-col space-y-4"
                itemClassName="text-slate-600 hover:text-slate-800 text-lg"
                onClose={() => setIsOpen(false)}
              />

              <div className="absolute bottom-6 inset-x-6">
                <div className="flex gap-2">
                  <a href={`tel:${brand.contact.phone.primary}`} className='flex-1' rel="noreferrer">
                    <Button variant="outline" size="lg" className="w-full border-orange-500 p-2 flex justify-center items-center gap-2">
                      <div dir='ltr' className="font-semibold text-sm text-orange-600">{brand.contact.phone.display}</div>
                      <IconPhone color="#FC4258" className="size-4" />
                    </Button>
                  </a>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </>
  );
}

