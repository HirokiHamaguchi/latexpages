import { Container, VStack } from '@chakra-ui/react';
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
        <>
            <TopNavHeader
                navItems={headerConfig.navItems}
                pageLabel={headerConfig.label}
                projectHomePath={headerConfig.homePath}
            />
            <Container maxW="container.xl" py={8} as="main">
                <VStack gap={4} align="stretch">
                    {children}
                </VStack>
                <Footer links={footerLinks} />
            </Container>
        </>
    );
}
