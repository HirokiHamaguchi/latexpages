import { HStack, Heading, Image, Text, VStack } from '@chakra-ui/react';
import { BASE_URL } from '../../constants/app';
import { PROJECT_METADATA } from '../../constants/projectMetadata';

export function MainHero() {
    return (
        <VStack justify="center" align="center" mb={4}>
            <HStack align="center">
                <Image
                    src={`${BASE_URL}lintIconLight_copied.svg`}
                    alt="LaTeX Lint Icon"
                    boxSize="2.5em"
                    mr={2}
                />
                <Heading as="h1" size="3xl" color="#333333">
                    <Text fontFamily="Times New Roman, serif">{PROJECT_METADATA.latexlint.label}</Text>
                </Heading>
            </HStack>
            <Text fontSize="lg" color="gray.500">
                {PROJECT_METADATA.latexlint.tagline}
            </Text>
        </VStack>
    );
}
