import { Box, Container, VStack } from '@chakra-ui/react';
import { Footer } from '../Footer';
import { TopNavHeader } from '../TopNavHeader';
import { PROJECTS } from '../../app/projects/projectRegistry';
import type { FooterLinkItem, ProjectKey } from '../../app/projects/projectRegistry';

type PageLayoutProps = {
    children: React.ReactNode;
    footerLinks?: FooterLinkItem[];
    projectKey?: ProjectKey;
};

export function PageLayout({ children, footerLinks, projectKey = 'latexlint' }: PageLayoutProps) {
    const project = PROJECTS[projectKey];
    const resolvedFooterLinks = footerLinks ?? [...project.footerLinks];

    return (
        // Fill at least the viewport and arrange the header, main content, and footer vertically.
        <Box minH="100vh" display="flex" flexDirection="column">
            <TopNavHeader
                navItems={project.navItems}
                pageLabel={project.label}
                projectHomePath={project.homePath}
            />
            <Container
                maxW="container.xl"
                py={8}
                as="main"
                // Take any unused viewport height so a short page still pushes its footer down.
                flex="1"
                display="flex"
                flexDirection="column"
            >
                <VStack gap={4} align="stretch" flex="1">
                    {children}
                </VStack>
                <Footer links={resolvedFooterLinks} />
            </Container>
        </Box>
    );
}
