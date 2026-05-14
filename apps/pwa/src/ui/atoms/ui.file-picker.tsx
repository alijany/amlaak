'use client';

import React, { useRef } from "react";
import { cn } from "@/libs/style/style.util.helpers";
import { IconUpload } from "@tabler/icons-react";
import { Button } from "./ui.button";

export interface FilePickerProps {
    onFilesSelected?: (files: FileList) => void;
    accept?: string;
    multiple?: boolean;
    className?: string;
    label?: string;
    description?: React.ReactNode;
    icon?: React.ReactNode;
    disabled?: boolean;
}

export const FilePicker: React.FC<FilePickerProps> = ({
    onFilesSelected,
    accept,
    multiple = false,
    className,
    label = "انتخاب فایل",
    description = (
        <>
            فیلم و یا تصویر آگهی خود را اینجا بکشید و رها کنید
            <br />
            و یا برای انتخاب فایل <span className="text-primary cursor-pointer">اینجا کلیک کنید</span>
        </>
    ),
    icon,
    disabled = false,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (disabled) return;
        if (e.dataTransfer.files && onFilesSelected) {
            onFilesSelected(e.dataTransfer.files);
        }
    };

    const handleClick = () => {
        if (disabled) return;
        inputRef.current?.click();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && onFilesSelected) {
            onFilesSelected(e.target.files);
        }
    };

    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center border-2 border-dashed border-slate-400 bg-slate-50 rounded-2xl p-8 text-center transition",
                !disabled && "hover:border-primary cursor-pointer",
                disabled && "opacity-60 cursor-not-allowed border-slate-300",
                className
            )}
            onClick={disabled ? undefined : handleClick}
            onDrop={disabled ? undefined : handleDrop}
            onDragOver={disabled ? undefined : (e => e.preventDefault())}
            tabIndex={disabled ? -1 : 0}
            role="button"
            aria-disabled={disabled}
        >
            <div className="mb-4 flex flex-col items-center gap-2">
                {icon || (
                    <IconUpload
                        className={cn("h-12 w-12 text-slate-500", disabled && "text-slate-400")}
                        aria-hidden="true"
                    />
                )}
                <div className={cn("text-slate-500 font-medium leading-7", disabled && "text-slate-400")}>{description}</div>
            </div>
            <Button
                variant="white"
                disabled={disabled}
                onClick={e => {
                    e.stopPropagation();
                    if (!disabled) handleClick();
                }}
            >
                {label}
            </Button>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                className="hidden"
                onChange={handleChange}
                tabIndex={-1}
                disabled={disabled}
            />
        </div>
    );
};
