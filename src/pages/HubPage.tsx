import {
    Badge,
    Box,
    Button,
    Grid,
    Heading,
    HStack,
    Text,
    VStack,
} from '@chakra-ui/react';
import 'github-markdown-css/github-markdown-light.css';
import { Link as RouterLink } from 'react-router-dom';
import declarationContent from '../assets/latexpages_README.md?raw';
import { PROJECT_METADATA } from '../constants/projectMetadata';
import { FOOTER_LINK_SETS } from '../components/Footer';
import { PageLayout } from '../components/layout/PageLayout';
import { Hero } from '../components/hero/Hero';
import { ReadmeMarkdown } from './readme/ReadmeMarkdown';

type ProjectItem = {
    label: string;
    description: string;
    status: 'available' | 'construction' | 'planned';
    path?: string;
};

const PROJECTS: ProjectItem[] = [
    PROJECT_METADATA.latexlint,
    PROJECT_METADATA.latexcitation,
    PROJECT_METADATA.latexwriting,
];

function ProjectCard({ project }: { project: ProjectItem }) {
    const isAvailable = project.status === 'available';

    return (
        <Box
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="md"
            bg="white"
            p={5}
            minH="180px"
        >
            <VStack align="stretch" gap={4} h="full">
                <HStack justify="space-between" align="start">
                    <Heading as="h2" size="md" fontFamily="Times New Roman, serif">
                        {project.label}
                    </Heading>
                    <Badge colorPalette={project.status === 'available' ? 'green' : project.status === 'construction' ? 'red' : 'gray'}>
                        {project.status === 'available' ? 'Available' : project.status === 'construction' ? 'Under Construction' : 'Planned'}
                    </Badge>
                </HStack>
                <Text color="gray.600" flex="1">
                    {project.description}
                </Text>
                {project.path ? (
                    <Button asChild colorPalette={isAvailable ? 'blue' : 'gray'} alignSelf="flex-start">
                        <RouterLink to={project.path}>Open</RouterLink>
                    </Button>
                ) : (
                    <Button disabled alignSelf="flex-start">
                        Coming Soon
                    </Button>
                )}
            </VStack>
        </Box>
    );
}

export function HubPage() {
    return (
        <PageLayout footerLinks={FOOTER_LINK_SETS.latexpages} projectKey="latexpages">
            <Hero
                label={PROJECT_METADATA.latexpages.label}
                subtitle={PROJECT_METADATA.latexpages.description}
                iconAlt={PROJECT_METADATA.latexpages.label}
            />
            <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
                {PROJECTS.map((project) => (
                    <ProjectCard key={project.label} project={project} />
                ))}
            </Grid>
            <Box className="markdown-body">
                <ReadmeMarkdown content={declarationContent} />
            </Box>
        </PageLayout>
    );
}
