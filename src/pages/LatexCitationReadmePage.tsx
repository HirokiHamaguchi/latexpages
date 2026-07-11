import { Badge, Box, VStack } from '@chakra-ui/react';
import 'github-markdown-css/github-markdown-light.css';
import { useRef } from 'react';
import { useParams } from 'react-router-dom';
import readmeContent from '../assets/latexcitation_README.md?raw';
import { FOOTER_LINK_SETS } from '../components/Footer';
import { PageLayout } from '../components/layout/PageLayout';
import { ROUTES } from '../constants/routes';
import { ReadmeMarkdown } from './readme/ReadmeMarkdown';
import { useReadmeAnchorScroll } from './readme/useReadmeAnchorScroll';

export function LatexCitationReadmePage() {
    const readmeRef = useRef<HTMLDivElement>(null);
    const params = useParams<{ anchor?: string }>();
    useReadmeAnchorScroll(params.anchor, readmeRef);

    return (
        <PageLayout
            footerLinks={FOOTER_LINK_SETS.latexcitation}
            projectKey="latexcitation"
        >
            <VStack align="stretch" gap={4}>
                <Badge colorPalette="red" alignSelf="flex-start">Under Construction</Badge>
                <Box className="markdown-body" ref={readmeRef}>
                    <ReadmeMarkdown content={readmeContent} routeBase={ROUTES.LATEXCITATION_README} />
                </Box>
            </VStack>
        </PageLayout>
    );
}
