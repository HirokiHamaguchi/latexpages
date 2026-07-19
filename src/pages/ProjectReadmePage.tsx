import { Badge, Box, VStack } from '@chakra-ui/react';
import 'github-markdown-css/github-markdown-light.css';
import { useRef } from 'react';
import { useParams } from 'react-router-dom';
import { PROJECTS } from '../app/projects/projectRegistry';
import type { ProjectKey } from '../app/projects/projectRegistry';
import { PageLayout } from '../components/layout/PageLayout';
import { ReadmeMarkdown } from './readme/ReadmeMarkdown';
import { useReadmeAnchorScroll } from './readme/useReadmeAnchorScroll';

type ProjectReadmePageProps = {
    projectKey: Extract<ProjectKey, 'latexlint' | 'latexcitation'>;
    content: string;
};

export function ProjectReadmePage({ projectKey, content }: ProjectReadmePageProps) {
    const project = PROJECTS[projectKey];
    const readmeRef = useRef<HTMLDivElement>(null);
    const params = useParams<{ anchor?: string }>();
    useReadmeAnchorScroll(params.anchor, readmeRef);

    return (
        <PageLayout projectKey={projectKey}>
            <VStack align="stretch" gap={4}>
                {project.status === 'construction' && (
                    <Badge colorPalette="red" alignSelf="flex-start">Under Construction</Badge>
                )}
                <Box className="markdown-body" ref={readmeRef}>
                    <ReadmeMarkdown
                        content={content}
                        routeBase={project.readmeRouteBase}
                        rawBaseUrl={project.readmeRawBase}
                    />
                </Box>
            </VStack>
        </PageLayout>
    );
}
