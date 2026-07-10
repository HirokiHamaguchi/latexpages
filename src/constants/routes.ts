export const ROUTES = {
    HUB: '/',
    LATEXLINT: '/latexlint',
    LATEXLINT_README: '/latexlint/readme',
    LATEXLINT_OTHER: '/latexlint/other',
    LATEXCITATION: '/latexcitation',
    LATEXWRITING: '/latexwriting',
} as const;

export const NAV_ITEMS = [
    { label: 'Home', path: ROUTES.LATEXLINT },
    { label: 'README', path: ROUTES.LATEXLINT_README },
    { label: 'Other', path: ROUTES.LATEXLINT_OTHER },
] as const;
