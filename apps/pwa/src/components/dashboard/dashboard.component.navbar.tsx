"use client";

import { AppLogo } from "@/components/theme/theme.component.logo";
import { brand } from "@/config/brand.config";
import { Button } from "@/ui/atoms";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { IconMenu4, IconX } from "@tabler/icons-react";
import Link from "next/link";
import React, { Fragment } from "react";
import { MenuItems } from "./dashboard.component.menu-items";
import { NotificationDropdown } from "./dashboard.component.notification-dropdown";

export const Navbar = () => {

    const [isOpen, setIsOpen] = React.useState(false);


    return (
        <div className="flex items-center justify-between gap-4">
            <Button onClick={() => { setIsOpen(true) }} variant="secondary" className="!px-2 lg:hidden">
                <IconMenu4 size={20} />
            </Button>

            <Link href='/' className="flex items-center gap-2" style={{ textDecoration: "none" }}>
                <AppLogo size={72} />
                <div style={{ lineHeight: 1.1 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "var(--slate-800)" }}>{brand.nameShort}</div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: "var(--rose-500)" }}>{brand.namePrimary}</div>
                </div>
            </Link>

            <NotificationDropdown />

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
                        <DialogPanel className="fixed inset-y-0 right-0 w-[80%] max-w-sm bg-white shadow-xl p-6 h-screen flex flex-col">
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-2" style={{ textDecoration: "none" }}>
                                    <AppLogo size={28} />
                                    <div style={{ lineHeight: 1.1 }}>
                                        <div style={{ fontSize: 12, fontWeight: 800, color: "var(--slate-800)" }}>{brand.nameShort}</div>
                                        <div style={{ fontSize: 12, fontWeight: 900, color: "var(--rose-500)" }}>{brand.namePrimary}</div>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className='p-2'
                                    onClick={() => setIsOpen(false)}
                                >
                                    <IconX className="size-4" />
                                </Button>
                            </div>

                            <MenuItems
                                className="flex flex-col space-y-4 grow overflow-hidden lg:overflow-auto"
                                itemClassName="text-slate-600 hover:text-slate-800 text-lg"
                                onClose={() => setIsOpen(false)}
                            />
                        </DialogPanel>
                    </TransitionChild>
                </Dialog>
            </Transition>
        </div>
    )
}