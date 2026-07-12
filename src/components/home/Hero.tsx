import { HStack, Heading, Image, Text, VStack } from '@chakra-ui/react';
import { BASE_URL } from '../../constants/app';

type HeroProps = {
    label: string;
    subtitle: string;
    iconAlt: string;
};

export function Hero({ label, subtitle, iconAlt }: HeroProps) {
    return (
        <VStack justify="center" align="center" mb={4}>
            <HStack align="center">
                <Image
                    src={`${BASE_URL}lintIconLight_copied.svg`}
                    alt={iconAlt}
                    boxSize="2.5em"
                    mr={2}
                />
                <Heading as="h1" size="3xl" color="#333333">
                    <Text fontFamily="Times New Roman, serif">{label}</Text>
                </Heading>
            </HStack>
            <Text fontSize="lg" color="gray.500" textAlign="center">
                {subtitle}
            </Text>
        </VStack>
    );
}
