import { IconArrowDown } from "@tabler/icons-react";

export const CollapsibleSection = ({
    title,
    children,
    isOpen,
    onToggle
}: {
    title: string;
    children?: React.ReactNode;
    isOpen?: boolean;
    onToggle?: () => void;
}) => {
    return (
        <div>
            <button
                onClick={onToggle}
                className="flex items-center py-6 justify-between w-full focus:outline-none"
            >
                <span className='font-normal to-slate-600'>{title}</span>
                <IconArrowDown
                    className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`}
                    size={20}
                />
            </button>
            <div className={`transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                {children}
            </div>
        </div>
    );
};