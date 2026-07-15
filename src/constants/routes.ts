export const ROUTES = {
    HUB: '/',
    LATEXLINT: '/latexlint',
    LATEXLINT_README: '/latexlint/readme',
    LATEXLINT_OTHER: '/latexlint/other',
    LATEXCITATION: '/latexcitation',
    LATEXCITATION_README: '/latexcitation/readme',
    LATEXCITATION_OTHER: '/latexcitation/other',
    LATEXWRITING: '/latexwriting',
    LATEXWRITING_OTHER: '/latexwriting/other',
} as const;

export type NavItem = {
    label: string;
    path: string;
};

export const PROJECT_PAGE_SETS = {
    latexlint: [
        { label: 'Home', path: ROUTES.LATEXLINT },
        { label: 'README', path: ROUTES.LATEXLINT_README },
        { label: 'Other', path: ROUTES.LATEXLINT_OTHER },
    ],
    latexcitation: [
        { label: 'Home', path: ROUTES.LATEXCITATION },
        { label: 'README', path: ROUTES.LATEXCITATION_README },
        { label: 'Other', path: ROUTES.LATEXCITATION_OTHER },
    ],
    latexwriting: [
        { label: 'Home', path: ROUTES.LATEXWRITING },
        { label: 'Other', path: ROUTES.LATEXWRITING_OTHER },
    ],
} as const;

export const PROJECT_HEADER_CONFIGS = {
    latexpages: {
        label: 'LaTeX Pages',
        homePath: '',
        navItems: [],
    },
    latexlint: {
        label: 'LaTeX Lint',
        homePath: ROUTES.LATEXLINT,
        navItems: PROJECT_PAGE_SETS.latexlint,
    },
    latexcitation: {
        label: 'LaTeX Citation',
        homePath: ROUTES.LATEXCITATION,
        navItems: PROJECT_PAGE_SETS.latexcitation,
    },
    latexwriting: {
        label: 'LaTeX Writing',
        homePath: ROUTES.LATEXWRITING,
        navItems: PROJECT_PAGE_SETS.latexwriting,
    },
} as const;

export type ProjectKey = keyof typeof PROJECT_HEADER_CONFIGS;
