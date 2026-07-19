import { BASE_URL } from '../../constants/app';
import { ROUTES } from '../../constants/routes';

export type NavItem = {
    label: string;
    path: string;
};

export type FooterLinkItem = {
    icon: string;
    label: string;
    href?: string;
    to?: string;
    roundIcon?: boolean;
    reload?: boolean;
};

export type ProjectStatus = 'available' | 'construction' | 'planned';

export type ProjectKey = 'latexpages' | 'latexlint' | 'latexcitation' | 'latexwriting';

export type ProjectDefinition = {
    label: string;
    description: string;
    tagline?: string;
    status?: ProjectStatus;
    path?: string;
    homePath: string;
    navItems: readonly NavItem[];
    footerLinks: readonly FooterLinkItem[];
    readmeRouteBase?: string;
    readmeRawBase?: string;
};

const projectPageLink = (to: string): FooterLinkItem => ({
    href: `${BASE_URL}${to.replace(/^\//, '')}`,
    icon: 'lintIconLight_copied.svg',
    label: 'Project Page',
    reload: true,
});

const githubRepositoryLink = (repository: string): FooterLinkItem => ({
    href: `https://github.com/HirokiHamaguchi/${repository}`,
    icon: 'mark-github-24.svg',
    label: 'GitHub Repository',
});

const DEVELOPER_SITE_LINK = {
    href: 'https://hirokihamaguchi.github.io/',
    icon: 'profile_icon256.webp',
    label: "Developer's Site",
    roundIcon: true,
} satisfies FooterLinkItem;

export const PROJECTS: Record<ProjectKey, ProjectDefinition> = {
    latexpages: {
        label: 'LaTeX Pages',
        description: 'Web versions of LaTeX tools and notes for academic writing.',
        homePath: '',
        navItems: [],
        footerLinks: [
            projectPageLink(ROUTES.HUB),
            DEVELOPER_SITE_LINK,
            githubRepositoryLink('latexpages'),
        ],
    },
    latexlint: {
        label: 'LaTeX Lint',
        description: 'Linter to detect common LaTeX and academic writing issues.',
        tagline: 'Linter to detect common LaTeX and academic writing issues',
        status: 'available',
        path: ROUTES.LATEXLINT,
        homePath: ROUTES.LATEXLINT,
        navItems: [
            { label: 'Home', path: ROUTES.LATEXLINT },
            { label: 'README', path: ROUTES.LATEXLINT_README },
            { label: 'Other', path: ROUTES.LATEXLINT_OTHER },
        ],
        footerLinks: [
            projectPageLink(ROUTES.LATEXLINT),
            {
                href: 'https://marketplace.visualstudio.com/items?itemName=hari64boli64.latexlint',
                icon: 'Visual_Studio_Code_1.35_icon.svg',
                label: 'VS Code Extension',
            },
            githubRepositoryLink('latexlint'),
        ],
        readmeRouteBase: ROUTES.LATEXLINT_README,
        readmeRawBase: 'https://raw.githubusercontent.com/HirokiHamaguchi/latexlint/master/',
    },
    latexcitation: {
        label: 'LaTeX Citation',
        description: 'Experimental citation consistency checker for LaTeX projects that visualizes BibTeX field usage.',
        status: 'construction',
        path: ROUTES.LATEXCITATION,
        homePath: ROUTES.LATEXCITATION,
        navItems: [
            { label: 'Home', path: ROUTES.LATEXCITATION },
            { label: 'README', path: ROUTES.LATEXCITATION_README },
            { label: 'Other', path: ROUTES.LATEXCITATION_OTHER },
        ],
        footerLinks: [
            projectPageLink(ROUTES.LATEXCITATION),
            DEVELOPER_SITE_LINK,
            githubRepositoryLink('latexcitation'),
        ],
        readmeRouteBase: ROUTES.LATEXCITATION_README,
        readmeRawBase: 'https://raw.githubusercontent.com/HirokiHamaguchi/latexcitation/master/',
    },
    latexwriting: {
        label: 'LaTeX Writing',
        description: 'Under-construction collection of notes and utilities for academic writing with LaTeX.',
        status: 'construction',
        path: ROUTES.LATEXWRITING,
        homePath: ROUTES.LATEXWRITING,
        navItems: [
            { label: 'Home', path: ROUTES.LATEXWRITING },
            { label: 'Other', path: ROUTES.LATEXWRITING_OTHER },
        ],
        footerLinks: [
            projectPageLink(ROUTES.LATEXWRITING),
            DEVELOPER_SITE_LINK,
            githubRepositoryLink('latexwriting'),
        ],
    },
};

export const PRIMARY_PROJECT_KEYS: Exclude<ProjectKey, 'latexpages'>[] = [
    'latexlint',
    'latexcitation',
    'latexwriting',
];
