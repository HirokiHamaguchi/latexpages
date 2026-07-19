import { Link, Text, VStack } from '@chakra-ui/react';
import { BASE_URL } from '../constants/app';
import { SectionHeading } from './typography/SectionHeading';

export function DeclarationSection() {
    return (
        <VStack align="stretch">
            <SectionHeading>Declaration</SectionHeading>
            <Text>
                Our commitments on development, privacy, and non-commercial operation are described in the{' '}
                <Link
                    href={`${BASE_URL}#declaration`}
                    color="blue.600"
                    textDecoration="none"
                    _hover={{ textDecoration: 'underline' }}
                >
                    LaTeX Pages declaration
                </Link>.
            </Text>
        </VStack>
    );
}
