"use client";

import React from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { TermsModal } from '../modals/modals.component.terms';
import { IconAddressBook, IconPhone, IconPhoneCall } from '@tabler/icons-react';

export const Footer: React.FC = () => {
    const [termsModalOpen, setTermsModalOpen] = React.useState(false);

    return (
        <footer className="bg-white rounded-t-[3rem] shadow-2xl shadow-black/5 border-t border-slate-100">
            <div className="container mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-5 gap-12 px-8 pt-14">
                {/* Brand + Narrative */}
                <div className="flex flex-col items-start lg:col-span-2">
                    <div className="flex items-center space-x-reverse space-x-2 mb-4">
                        <Image src="/images/logo.svg" alt="Logo" width={32} height={32} className='w-8 h-8' />
                        <span className='text-xl font-bold text-slate-800'>مونو</span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                        پلتفرم هوشمند تبدیل مکالمات کاربران به اینسایت اجرایی. بدون فرم‌های طولانی، فقط گفتگوی طبیعی و خروجی قابل تصمیم. از نیاز پنهان تا اقدام پیشنهادی را در یک داشبورد ببین.
                    </p>
                    {/* trust seal moved to its own column */}
                </div>

                {/* Site Map */}
                <div className="flex flex-col">
                    <h4 className="text-sm font-semibold text-slate-700 mb-4">نقشه سایت</h4>
                    <ul className="space-y-3 text-sm">
                        <li><Link href="/#activities" className="text-slate-600 hover:text-slate-800">فرآیند کار</Link></li>
                        <li><Link href="/#" className="text-slate-600 hover:text-slate-800">ویژگی‌ها</Link></li>
                        <li><Link href="/#" className="text-slate-600 hover:text-slate-800">نمونه خروجی</Link></li>
                        <li><Link href="/#faq" className="text-slate-600 hover:text-slate-800">سوالات متداول</Link></li>
                        <li><button onClick={() => setTermsModalOpen(true)} className="text-slate-600 hover:text-slate-800">قوانین استفاده</button></li>
                        <li><Link href="/about" className="text-slate-600 hover:text-slate-800">درباره ما</Link></li>
                    </ul>
                </div>

                {/* Contact */}
                <div className="flex flex-col">
                    <h4 className="text-sm font-semibold text-slate-700 mb-4">ارتباط با ما</h4>
                    <ul className="space-y-3 text-sm text-slate-600">
                        <li className="flex items-center gap-2">
                            <IconPhone name="phone" size={20} className="text-blue-600" />
                            <a href="tel:+989104007068" dir='ltr' className='hover:text-slate-800'>0910 400 7068</a>
                        </li>
                        <li className="flex items-center gap-2">
                            <IconPhoneCall name="phone" size={20} className="text-blue-600" />
                            <a href="tel:+981333352174" dir='ltr' className='hover:text-slate-800'>013 3335 2174</a>
                        </li>
                        <li className="flex items-start gap-2">
                            <IconAddressBook size={20} className="text-blue-600 mt-1 min-w-5" />
                            <span className='text-slate-600'>رشت، رودبارتان، کوچه شهید محمدپور، ساختمان مهرگان</span>
                        </li>
                    </ul>
                </div>

                {/* Trust seal */}
                <div className="flex flex-col items-start">
                    {/* <div className="flex gap-2 justify-center lg:justify-start">
                        <a referrerPolicy='origin' target='_blank' href='https://trustseal.enamad.ir/?id=676364&Code=7h8XiT8Q3xqawQKvHVNwVM4LH1iDrCqG'>
                            <img referrerPolicy='origin' className='max-w-24' src='https://trustseal.enamad.ir/logo.aspx?id=676364&Code=7h8XiT8Q3xqawQKvHVNwVM4LH1iDrCqG' alt='' />
                        </a>
                    </div> */}
                </div>
            </div>

            <div className="mt-12 border-t border-slate-100 p-8 text-center text-xs text-slate-500">
                © 1404 کلیه حقوق محفوظ است. استفاده فقط طبق قوانین و سیاست حفظ حریم خصوصی.
            </div>

            <TermsModal isOpen={termsModalOpen} onClose={() => setTermsModalOpen(false)} />
        </footer>
    );
};
