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
import { PRIMARY_PROJECT_KEYS, PROJECTS as PROJECT_REGISTRY } from '../../app/projects/projectRegistry';
import latexpagesReadmeContent from '../../assets/latexpages_README.md?raw';
import { Hero } from '../../components/hero/Hero';
import { PageLayout } from '../../components/layout/PageLayout';
import { ReadmeMarkdown } from '../../pages/readme/ReadmeMarkdown';

type ProjectItem = {
    label: string;
    description: string;
    status: 'available' | 'construction' | 'planned';
    path?: string;
};

const PROJECT_CARDS: ProjectItem[] = PRIMARY_PROJECT_KEYS.map((key) => ({
    label: PROJECT_REGISTRY[key].label,
    description: PROJECT_REGISTRY[key].description,
    status: PROJECT_REGISTRY[key].status ?? 'planned',
    path: PROJECT_REGISTRY[key].path,
}));

function extractMarkdownSection(content: string, heading: string) {
    const lines = content.split(/\r?\n/);
    const start = lines.findIndex((line) => line.trim() === heading);
    if (start === -1) {
        return '';
    }

    const end = lines.findIndex((line, index) => index > start && line.startsWith('#'));
    return lines.slice(start, end === -1 ? undefined : end).join('\n').trimEnd() + '\n';
}

const declarationContent = extractMarkdownSection(latexpagesReadmeContent, '## Declaration');

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
        <PageLayout projectKey="latexpages">
            <Hero
                label={PROJECT_REGISTRY.latexpages.label}
                subtitle={PROJECT_REGISTRY.latexpages.description}
                iconAlt={PROJECT_REGISTRY.latexpages.label}
            />
            <Grid templateColumns="1fr" gap={4}>
                {PROJECT_CARDS.map((project) => (
                    <ProjectCard key={project.label} project={project} />
                ))}
            </Grid>
            <Box className="markdown-body">
                <ReadmeMarkdown content={declarationContent} />
            </Box>
        </PageLayout>
    );
}
