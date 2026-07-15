import { Box, Container, VStack } from '@chakra-ui/react';
import type { FooterLinkItem } from '../Footer';
import { FOOTER_LINK_SETS, Footer } from '../Footer';
import { TopNavHeader } from '../TopNavHeader';
import { PROJECT_HEADER_CONFIGS } from '../../constants/routes';
import type { ProjectKey } from '../../constants/routes';

type PageLayoutProps = {
    children: React.ReactNode;
    footerLinks?: FooterLinkItem[];
    projectKey?: ProjectKey;
};

export function PageLayout({ children, footerLinks = FOOTER_LINK_SETS.latexlint, projectKey = 'latexlint' }: PageLayoutProps) {
    const headerConfig = PROJECT_HEADER_CONFIGS[projectKey];

    return (
        // Fill at least the viewport and arrange the header, main content, and footer vertically.
        <Box minH="100vh" display="flex" flexDirection="column">
            <TopNavHeader
                navItems={headerConfig.navItems}
                pageLabel={headerConfig.label}
                projectHomePath={headerConfig.homePath}
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
                <Footer links={footerLinks} />
            </Container>
        </Box>
    );
}
