import { Badge, Box, Heading, Text, VStack } from '@chakra-ui/react';
import { FOOTER_LINK_SETS } from '../components/Footer';
import { PageLayout } from '../components/layout/PageLayout';
import { PROJECT_METADATA } from '../constants/projectMetadata';

export function LatexWritingPage() {
    return (
        <PageLayout
            footerLinks={FOOTER_LINK_SETS.latexwriting}
            projectKey="latexwriting"
        >
            <Box borderWidth="1px" borderColor="gray.200" borderRadius="md" bg="white" p={6}>
                <VStack align="stretch" gap={4}>
                    <VStack align="stretch" gap={1}>
                        <Heading as="h1" size="2xl" fontFamily="Times New Roman, serif">
                            {PROJECT_METADATA.latexwriting.label}
                        </Heading>
                        <Badge colorPalette="red" alignSelf="flex-start">Under Construction</Badge>
                    </VStack>
                    <Text color="gray.600">
                        {PROJECT_METADATA.latexwriting.description}
                    </Text>
                </VStack>
            </Box>
        </PageLayout>
    );
}
