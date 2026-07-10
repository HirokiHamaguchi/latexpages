import {
    Badge,
    Box,
    Button,
    Container,
    Heading,
    HStack,
    Image,
    Text,
    VStack,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FOOTER_LINK_SETS, Footer } from '../components/Footer';
import { BASE_URL } from '../constants/app';
import { ROUTES } from '../constants/routes';

type ProjectPlaceholderPageProps = {
    title: string;
    description: string;
};

export function ProjectPlaceholderPage({ title, description }: ProjectPlaceholderPageProps) {
    return (
        <Container maxW="container.xl" py={8} as="main">
            <VStack gap={8} align="stretch">
                <HStack align="center" justify="space-between" gap={4} flexWrap="wrap">
                    <RouterLink to={ROUTES.HUB} aria-label="Go to LaTeX Pages">
                        <HStack align="center" gap={2}>
                            <Image
                                src={`${BASE_URL}lintIconLight_copied.svg`}
                                alt=""
                                boxSize="1.8rem"
                            />
                            <Text fontWeight="semibold" fontFamily="Times New Roman, serif">
                                LaTeX Pages
                            </Text>
                        </HStack>
                    </RouterLink>
                    <Badge colorPalette="gray">Planned</Badge>
                </HStack>
                <Box borderWidth="1px" borderColor="gray.200" borderRadius="md" bg="white" p={6}>
                    <VStack align="stretch" gap={4}>
                        <Heading as="h1" size="2xl" fontFamily="Times New Roman, serif">
                            {title}
                        </Heading>
                        <Text color="gray.600">{description}</Text>
                        <Button asChild alignSelf="flex-start">
                            <RouterLink to={ROUTES.HUB}>Back to LaTeX Pages</RouterLink>
                        </Button>
                    </VStack>
                </Box>
                <Footer links={FOOTER_LINK_SETS.latexpages} />
            </VStack>
        </Container>
    );
}
