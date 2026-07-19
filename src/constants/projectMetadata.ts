import { PROJECTS } from '../app/projects/projectRegistry';

export const PROJECT_METADATA = {
    latexpages: {
        label: PROJECTS.latexpages.label,
        description: PROJECTS.latexpages.description,
    },
    latexlint: {
        label: PROJECTS.latexlint.label,
        description: PROJECTS.latexlint.description,
        tagline: PROJECTS.latexlint.tagline,
        status: PROJECTS.latexlint.status,
        path: PROJECTS.latexlint.path,
    },
    latexcitation: {
        label: PROJECTS.latexcitation.label,
        description: PROJECTS.latexcitation.description,
        status: PROJECTS.latexcitation.status,
        path: PROJECTS.latexcitation.path,
    },
    latexwriting: {
        label: PROJECTS.latexwriting.label,
        description: PROJECTS.latexwriting.description,
        status: PROJECTS.latexwriting.status,
        path: PROJECTS.latexwriting.path,
    },
} as const;

export type ProjectMetadataKey = keyof typeof PROJECT_METADATA;
