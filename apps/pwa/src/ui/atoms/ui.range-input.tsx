"use client"
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Range, getTrackBackground } from 'react-range';

interface RangeInputProps {
    minValue: number;
    maxValue: number;
    step?: number;
    onChange: (min: number, max: number) => void;
    fromLabel?: string;
    toLabel?: string;
    unit?: string;
    primaryColor?: string;
    debounceMs?: number; // Added debounce delay prop
}

export const RangeInput: React.FC<RangeInputProps> = ({
    minValue,
    maxValue,
    step = 1,
    onChange,
    fromLabel = 'از',
    toLabel = 'تا',
    unit = '',
    debounceMs = 300, // Default debounce of 300ms
}) => {
    const [values, setValues] = useState([minValue, maxValue]);
    const isMounted = useRef(false);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isMounted.current) {
            setValues([minValue, maxValue]);
        } else {
            isMounted.current = true;
        }
    }, [minValue, maxValue]);

    const handleChange = useCallback((min: number, max: number) => {
        if (isNaN(max)) return;

        const val = [min < minValue ? minValue : min, max > maxValue ? values[1] : max];
        setValues(val);

        // Clear any existing timeout
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Set a new timeout to call onChange after the debounce delay
        debounceTimerRef.current = setTimeout(() => {
            onChange(val[0], val[1]);
        }, debounceMs);
    }, [minValue, maxValue, values, onChange, debounceMs]);

    // Clean up the timeout when component unmounts
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    return (
        <div className='pb-6'>
            <div className="flex items-center justify-center space-x-2 space-x-reverse">
                <span className="text-slate-500">{fromLabel}</span>
                <input
                    dir='ltr'
                    value={values[0]}
                    onChange={(e) => {
                        const value = Math.min(Number(e.target.value), values[1]);
                        handleChange(value, values[1]);
                    }}
                    className="w-28 px-3 py-2 text-left text-base font-bold text-slate-800 border-b border-b-slate-200 focus:outline-none shadow-none"
                />
                {unit && <span className="text-xs text-slate-500">{unit}</span>}
            </div>

            <div className="flex items-center justify-center space-x-2 space-x-reverse mt-2">
                <span className="text-slate-500">{toLabel}</span>
                <input
                    dir='ltr'
                    value={values[1]}
                    onChange={(e) => {
                        const value = Math.min(Number(e.target.value), values[1]);
                        handleChange(values[0], value);
                    }}
                    className="w-28 px-3 py-2 text-left text-base font-bold text-slate-800 border-b border-b-slate-200 focus:outline-none shadow-none"
                />
                {unit && <span className="text-xs text-slate-500">{unit}</span>}
            </div>

            <div className="px-2 py-2 mt-6">
                <Range
                    values={values}
                    step={step}
                    min={minValue}
                    max={maxValue}
                    rtl={true}
                    onChange={(newValues) => {
                        handleChange(newValues[0], newValues[1]);
                    }}
                    renderTrack={({ props, children }) => (
                        <div
                            ref={props.ref}
                            className="w-full h-1 rounded-full bg-slate-200"
                            style={{
                                background: getTrackBackground({
                                    values,
                                    colors: ["#cbd5e1", "#475569", "#cbd5e1"],
                                    min: minValue,
                                    max: maxValue,
                                    rtl: true
                                })
                            }}
                        >
                            {children}
                        </div>
                    )}
                    renderThumb={({ props }) => (
                        <div
                            {...props}
                            key={props.key}
                            className="h-4 w-4 rounded-full bg-slate-600 shadow focus:outline-none"
                        />
                    )}
                />
                <div className='flex justify-between items-center mt-3'>
                    <span className='text-xs text-slate-500'>کمترین</span>
                    <span className='text-xs text-slate-500'>بیشترین</span>
                </div>
            </div>
        </div>
    );
};