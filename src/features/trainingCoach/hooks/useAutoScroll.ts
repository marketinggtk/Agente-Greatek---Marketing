import { useEffect, useRef, RefObject } from 'react';

/**
 * Hook to automatically scroll the element into view of its parent on update
 */
export const useAutoScroll = (dependency: any): RefObject<HTMLDivElement> => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [dependency]);

    return scrollRef;
};

