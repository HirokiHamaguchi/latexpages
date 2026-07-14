import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    README_ANCHOR_SCROLL_DELAY_MS,
    README_SCROLL_TOP_FALLBACK_OFFSET,
    README_SCROLL_TOP_MARGIN,
} from './constants';

export function useReadmeAnchorScroll(anchor: string | undefined, readmeRef: React.RefObject<HTMLDivElement | null>) {
    const { hash } = useLocation();

    useEffect(() => {
        const hashAnchor = hash ? decodeURIComponent(hash.slice(1)) : undefined;
        const targetAnchor = anchor ?? hashAnchor;
        if (!targetAnchor || !readmeRef.current) return;

        const timer = window.setTimeout(() => {
            if (!readmeRef.current) return;
            const targetId = targetAnchor.toLowerCase();
            const element = readmeRef.current.querySelector(`#${CSS.escape(targetId)}`);
            if (!element) {
                console.warn(`Element with id ${targetId} not found in README.`);
                return;
            }

            const scrollToElement = () => {
                const headerHeight = document
                    .querySelector<HTMLElement>('nav[aria-label="Primary page navigation"]')
                    ?.getBoundingClientRect().height ?? README_SCROLL_TOP_FALLBACK_OFFSET;
                const offsetTop = (element as HTMLElement).getBoundingClientRect().top
                    + window.scrollY
                    - headerHeight
                    - README_SCROLL_TOP_MARGIN;
                window.scrollTo({
                    top: Math.max(0, offsetTop),
                    behavior: 'auto',
                });
            };

            scrollToElement();
            readmeRef.current.querySelectorAll('img').forEach((img) => {
                if (!img.complete) img.addEventListener('load', scrollToElement, { once: true });
            });
        }, README_ANCHOR_SCROLL_DELAY_MS);

        return () => window.clearTimeout(timer);
    }, [anchor, hash, readmeRef]);
}
