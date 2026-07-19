import { Badge, Box, Text, VStack } from '@chakra-ui/react';
import { PROJECTS } from '../../app/projects/projectRegistry';
import { Hero } from '../../components/hero/Hero';
import { PageLayout } from '../../components/layout/PageLayout';

export function LatexWritingPage() {
    return (
        <PageLayout projectKey="latexwriting">
            <VStack align="stretch" gap={4}>
                <Hero
                    label={PROJECTS.latexwriting.label}
                    subtitle={PROJECTS.latexwriting.description}
                    iconAlt={PROJECTS.latexwriting.label}
                />
                <Badge colorPalette="red" alignSelf="center">Under Construction</Badge>
                <Box borderWidth="1px" borderColor="gray.200" borderRadius="md" bg="white" p={6}>
                    <Text color="gray.600">
                        {PROJECTS.latexwriting.description}
                    </Text>
                </Box>
            </VStack>
        </PageLayout>
    );
}
