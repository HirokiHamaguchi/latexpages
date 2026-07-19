import type { BibVariationCandidate } from '@latexcitation/index';
import { Badge, Box, HStack, Text, VStack } from '@chakra-ui/react';

export function ConsistencyNotes({ notes }: { notes: string[] }) {
    if (notes.length === 0) {
        return (
            <Box borderWidth="1px" borderColor="green.200" borderRadius="md" bg="green.50" p={4}>
                <Text color="green.800">No obvious field-presence inconsistencies were detected.</Text>
            </Box>
        );
    }

    return (
        <Box borderWidth="1px" borderColor="orange.200" borderRadius="md" bg="orange.50" p={4}>
            <VStack align="stretch" gap={2}>
                <Text fontWeight="semibold" color="orange.900">Potential consistency gaps before checking the tables</Text>
                {notes.map((note) => (
                    <Text key={note} color="orange.900">{note}</Text>
                ))}
            </VStack>
        </Box>
    );
}

export function VariationSummary({ candidates }: { candidates: BibVariationCandidate[] }) {
    return (
        <Box borderWidth="1px" borderColor="gray.200" borderRadius="md" bg="white" p={4}>
            <VStack align="stretch" gap={3}>
                <Text fontWeight="semibold">Possible spelling or notation variations</Text>
                {candidates.length === 0 ? (
                    <Text color="gray.600">No close variants were detected in author, editor, publisher, journal, or venue fields.</Text>
                ) : (
                    candidates.map((candidate) => (
                        <Box key={`${candidate.field}-${candidate.label}`} borderTopWidth="1px" borderColor="gray.100" pt={3}>
                            <HStack gap={2} mb={1}>
                                <Badge colorPalette="gray">{candidate.field}</Badge>
                                <Text fontSize="sm" color="gray.600">{candidate.label}</Text>
                            </HStack>
                            <Text fontSize="sm">{candidate.values.join(' / ')}</Text>
                        </Box>
                    ))
                )}
            </VStack>
        </Box>
    );
}
