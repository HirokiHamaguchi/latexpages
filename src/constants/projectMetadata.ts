import { ROUTES } from './routes';

export const PROJECT_METADATA = {
    latexpages: {
        label: 'LaTeX Pages',
        description: 'Web versions of LaTeX tools and notes for academic writing.',
    },
    latexlint: {
        label: 'LaTeX Lint',
        description: 'Linter to detect common LaTeX and academic writing issues.',
        tagline: 'Linter to detect common LaTeX and academic writing issues',
        status: 'available',
        path: ROUTES.LATEXLINT,
    },
    latexcitation: {
        label: 'LaTeX Citation',
        description: 'Experimental citation consistency checker for LaTeX projects that visualizes BibTeX field usage.',
        status: 'construction',
        path: ROUTES.LATEXCITATION,
    },
    latexwriting: {
        label: 'LaTeX Writing',
        description: 'Under-construction collection of notes and utilities for academic writing with LaTeX.',
        status: 'construction',
        path: ROUTES.LATEXWRITING,
    },
} as const;

export type ProjectMetadataKey = keyof typeof PROJECT_METADATA;
