import {
    Badge,
    Box,
    Button,
    Container,
    Grid,
    Heading,
    HStack,
    Image,
    Text,
    VStack,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { BASE_URL } from '../constants/app';
import { ROUTES } from '../constants/routes';
import { FOOTER_LINK_SETS, Footer } from '../components/Footer';

type ProjectItem = {
    title: string;
    description: string;
    status: 'available' | 'planned';
    to?: string;
};

const PROJECTS: ProjectItem[] = [
    {
        title: 'LaTeX Lint',
        description: 'Online LaTeX and Markdown checker for academic writing.',
        status: 'available',
        to: ROUTES.LATEXLINT,
    },
    {
        title: 'LaTeX Citation',
        description: 'Citation support tools for academic manuscripts.',
        status: 'planned',
        to: ROUTES.LATEXCITATION,
    },
    {
        title: 'LaTeX Writing',
        description: 'Writing notes and utilities for clearer technical documents.',
        status: 'planned',
        to: ROUTES.LATEXWRITING,
    },
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
                        {project.title}
                    </Heading>
                    <Badge colorPalette={project.status === 'available' ? 'green' : 'gray'}>
                        {project.status === 'available' ? 'Available' : 'Planned'}
                    </Badge>
                </HStack>
                <Text color="gray.600" flex="1">
                    {project.description}
                </Text>
                {project.to ? (
                    <Button asChild colorPalette={isAvailable ? 'blue' : 'gray'} alignSelf="flex-start">
                        <RouterLink to={project.to!}>Open</RouterLink>
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
        <Container maxW="container.xl" py={8} as="main">
            <VStack gap={8} align="stretch">
                <VStack align="center" gap={3} py={6}>
                    <HStack align="center">
                        <Image
                            src={`${BASE_URL}lintIconLight_copied.svg`}
                            alt="LaTeX Pages"
                            boxSize="2.5em"
                        />
                        <Heading as="h1" size="3xl" color="#333333">
                            <Text fontFamily="Times New Roman, serif">LaTeX Pages</Text>
                        </Heading>
                    </HStack>
                    <Text fontSize="lg" color="gray.500" textAlign="center">
                        Web tools and notes for academic LaTeX writing.
                    </Text>
                </VStack>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
                    {PROJECTS.map((project) => (
                        <ProjectCard key={project.title} project={project} />
                    ))}
                </Grid>
                <Footer links={FOOTER_LINK_SETS.latexpages} />
            </VStack>
        </Container>
    );
}
