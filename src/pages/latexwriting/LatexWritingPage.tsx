import { Badge, Box, Text, VStack } from '@chakra-ui/react';
import { FOOTER_LINK_SETS } from '../../components/Footer';
import { Hero } from '../../components/hero/Hero';
import { PageLayout } from '../../components/layout/PageLayout';
import { PROJECT_METADATA } from '../../constants/projectMetadata';

export function LatexWritingPage() {
    return (
        <PageLayout
            footerLinks={FOOTER_LINK_SETS.latexwriting}
            projectKey="latexwriting"
        >
            <VStack align="stretch" gap={4}>
                <Hero
                    label={PROJECT_METADATA.latexwriting.label}
                    subtitle={PROJECT_METADATA.latexwriting.description}
                    iconAlt={PROJECT_METADATA.latexwriting.label}
                />
                <Badge colorPalette="red" alignSelf="center">Under Construction</Badge>
                <Box borderWidth="1px" borderColor="gray.200" borderRadius="md" bg="white" p={6}>
                    <Text color="gray.600">
                        {PROJECT_METADATA.latexwriting.description}
                    </Text>
                </Box>
            </VStack>
        </PageLayout>
    );
}
