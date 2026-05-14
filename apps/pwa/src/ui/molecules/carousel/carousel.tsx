"use client";

import { cn } from "@/libs/style/style.util.helpers";
import { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowLeft01Icon, ArrowRight01Icon } from "hugeicons-react";
import React, { useCallback, useEffect, useState } from "react";

const useDotButton = (
    emblaApi: EmblaCarouselType | undefined
) => {
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

    const onDotButtonClick = useCallback(
        (index: number) => {
            if (!emblaApi) return
            emblaApi.scrollTo(index)
        },
        [emblaApi]
    )

    const onInit = useCallback((emblaApi: EmblaCarouselType) => {
        setScrollSnaps(emblaApi.scrollSnapList())
    }, [])

    const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
        setSelectedIndex(emblaApi.selectedScrollSnap())
    }, [])

    useEffect(() => {
        if (!emblaApi) return

        onInit(emblaApi)
        onSelect(emblaApi)
        emblaApi.on('reInit', onInit).on('reInit', onSelect).on('select', onSelect)
    }, [emblaApi, onInit, onSelect])

    return {
        selectedIndex,
        scrollSnaps,
        onDotButtonClick
    }
}

const usePrevNextButtons = (
    emblaApi: EmblaCarouselType | undefined
) => {
    const [prevBtnDisabled, setPrevBtnDisabled] = useState(true)
    const [nextBtnDisabled, setNextBtnDisabled] = useState(true)

    const onPrevButtonClick = useCallback(() => {
        if (!emblaApi) return
        emblaApi.scrollPrev()
    }, [emblaApi])

    const onNextButtonClick = useCallback(() => {
        if (!emblaApi) return
        emblaApi.scrollNext()
    }, [emblaApi])

    const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
        setPrevBtnDisabled(!emblaApi.canScrollPrev())
        setNextBtnDisabled(!emblaApi.canScrollNext())
    }, [])

    useEffect(() => {
        if (!emblaApi) return

        onSelect(emblaApi)
        emblaApi.on('reInit', onSelect).on('select', onSelect)
    }, [emblaApi, onSelect])

    return {
        prevBtnDisabled,
        nextBtnDisabled,
        onPrevButtonClick,
        onNextButtonClick
    }
}

interface CarouselProps {
    options?: EmblaOptionsType
    className?: string
    children: React.ReactNode
    showControls?: boolean
    header?: React.ReactNode
    showDots?: boolean
    containerClassName?: string
}

export const Carousel: React.FC<CarouselProps> = ({
    options = { align: 'start', direction: 'rtl', loop: true },
    className,
    children,
    showControls = true,
    header,
    showDots = true,
    containerClassName
}) => {
    const [emblaRef, emblaApi] = useEmblaCarousel(options)

    const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi)
    const {
        prevBtnDisabled,
        nextBtnDisabled,
        onPrevButtonClick,
        onNextButtonClick
    } = usePrevNextButtons(emblaApi)

    return (
        <div className={className}>
            <div className="flex justify-between items-center mb-6">
                {header}

                {showControls && (
                    <div className="text-white inline-grid grid-cols-2 gap-2 lg:gap-4">
                        <button
                            onClick={onPrevButtonClick}
                            disabled={prevBtnDisabled}
                            className="p-2 lg:p-3 cursor-pointer rounded-full bg-white/30"
                        >
                            <ArrowRight01Icon className="size-4 lg:size-6" />
                        </button>
                        <button
                            onClick={onNextButtonClick}
                            disabled={nextBtnDisabled}
                            className="p-2 lg:p-3 cursor-pointer rounded-full bg-white/30"
                        >
                            <ArrowLeft01Icon className="size-4 lg:size-6" />
                        </button>
                    </div>
                )}
            </div>

            <div className={cn("overflow-hidden", containerClassName)} ref={emblaRef}>
                <div className="flex">
                    {children}
                </div>
            </div>

            {showDots && (
                <div className="flex justify-center gap-0.5 mt-4">
                    {scrollSnaps.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => onDotButtonClick(index)}
                            className={cn(
                                "bg-slate-200 p-1.5 rounded-full transition-colors",
                                { 'bg-rose-500': index === selectedIndex }
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
