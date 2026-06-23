"use client";

import { brand } from '@/config/brand.config';
import { cn } from '@/libs/style/style.util.helpers';
import { Button } from '@/ui/atoms';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { IconBuildingEstate, IconCancel, IconMenu, IconPhone, IconUser } from '@tabler/icons-react';
import Link from 'next/link';
import { Fragment, useEffect, useState } from 'react';
import { useAuth } from '../auth/auth.context.provider';
import { MenuItems } from "./layout.component.menu-items";

export function Navbar({ transparent }: { transparent?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useAuth();

  // Over the hero we start transparent (white text); turn solid on scroll.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const overHero = !!transparent && !scrolled;

  return (
    <>
      <div className="z-30 sticky top-4 m-4 lg:top-6">
        <nav
          className={cn(
            'max-w-7xl mx-auto flex justify-between items-center rounded-2xl p-3 lg:p-4 border transition-all duration-300',
            overHero
              ? 'bg-white/10 backdrop-blur-xl border-white/30 shadow-lg shadow-black/10'
              : 'bg-white/90 backdrop-blur-xl border-white shadow-2xl shadow-black/10',
          )}
        >
          <div className="flex items-center gap-3">
            <Button
              className={cn(
                "lg:hidden visible p-2",
                overHero && "bg-white/10 border border-white/40 text-white hover:bg-white/20",
              )}
              variant="outline"
              size="lg"
              onClick={() => setIsOpen(true)}
            >
              <IconMenu className="size-4" />
            </Button>
            <Link href='/' className="flex items-center space-x-reverse space-x-2">
              <img
                src="/images/logo.svg"
                alt="Logo"
                className={cn("h-6 lg:h-8", overHero && "brightness-0 invert")}
              />
              <h1 className={cn("text-base lg:text-lg font-bold", overHero ? "text-white" : "text-slate-800")}>
                {brand.name}
              </h1>
            </Link>
          </div>

          <MenuItems
            light={overHero}
            onClose={() => setIsOpen(false)}
            className="lg:flex space-x-reverse space-x-6 hidden"
          />

          <div className='flex space-x-2 space-x-reverse items-center'>
            {!isAuthenticated && (
              <>
                <Link
                  href="/login"
                  className={cn(
                    "hidden sm:block text-sm font-medium px-2 transition-colors",
                    overHero ? "text-white/90 hover:text-white" : "text-slate-600 hover:text-slate-900",
                  )}
                >
                  ورود
                </Link>
                <Link className="block" href="/dashboard/listings">
                  <Button variant="primary" size="md" className="flex gap-2 text-white shadow-md shadow-blue-500/20">
                    <div className='text-sm hidden lg:block'>ثبت آگهی</div>
                    <IconBuildingEstate size={18} />
                  </Button>
                </Link>
              </>
            )}
            {isAuthenticated && (
              <Link className="block" href="/dashboard">
                <Button
                  variant={overHero ? 'white' : 'secondary'}
                  className="flex gap-3"
                >
                  <div className='text-sm hidden lg:block'>پنل کاربری</div>
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
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="ease-in duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <DialogPanel className="fixed inset-y-0 right-0 w-[80%] max-w-sm bg-white shadow-xl p-6">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-reverse space-x-2">
                  <img src="/images/logo.svg" alt="Logo" className="h-5" />
                  <h1 className="text-xl font-bold text-slate-900">{brand.name}</h1>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className='p-2'
                  onClick={() => setIsOpen(false)}
                >
                  <IconCancel className="size-4" />
                </Button>
              </div>

              <MenuItems
                className="flex flex-col space-y-4"
                itemClassName="text-slate-600 hover:text-slate-800 text-lg"
                onClose={() => setIsOpen(false)}
              />

              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex space-x-2 space-x-reverse">
                  <a href={`tel:${brand.contact.phone.primary}`} className='flex-1' rel="noreferrer">
                    <Button variant="outline" size="lg" className="w-full border-orange-500 p-2 flex justify-center items-center space-x-2 space-x-reverse">
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
