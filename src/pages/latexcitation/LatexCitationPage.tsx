import { analyzeBibDocument } from '@latexcitation/index';
import type { BibEntry } from '@latexcitation/index';
import { PROJECTS } from '../../app/projects/projectRegistry';
import {
    Badge,
    Box,
    SimpleGrid,
    Text,
    Textarea,
    VStack,
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import defaultBibText from '../../assets/default-latexcitation.bib?raw';
import { Hero } from '../../components/hero/Hero';
import { PageLayout } from '../../components/layout/PageLayout';
import { FieldPresenceTable } from './FieldPresenceTable';
import { ConsistencyNotes, VariationSummary } from './SummarySections';

export function LatexCitationPage() {
    const [bibText, setBibText] = useState(defaultBibText);
    const [bblText, setBblText] = useState('');
    const analysis = useMemo(() => analyzeBibDocument(bibText), [bibText]);
    const entriesByType = useMemo(() => {
        const map = new Map<string, BibEntry[]>();
        for (const entry of analysis.entries) {
            const entries = map.get(entry.type) ?? [];
            entries.push(entry);
            map.set(entry.type, entries);
        }
        return map;
    }, [analysis.entries]);
    const bblStatus = bblText.trim() ? 'BBL provided' : 'Bib-only';

    return (
        <PageLayout projectKey="latexcitation">
            <VStack gap={6} align="stretch">
                <VStack align="stretch" gap={1}>
                    <Hero
                        label={PROJECTS.latexcitation.label}
                        subtitle={PROJECTS.latexcitation.description}
                        iconAlt={PROJECTS.latexcitation.label}
                    />
                    <Badge colorPalette="red" alignSelf="center">Under Construction</Badge>
                    <Badge colorPalette={bblText.trim() ? 'green' : 'gray'} alignSelf="center">{bblStatus}</Badge>
                </VStack>

                <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>
                    <Box borderWidth="1px" borderColor="gray.200" borderRadius="md" p={4} bg="white">
                        <VStack align="stretch" gap={3}>
                            <Text fontWeight="semibold">.bib</Text>
                            <Textarea
                                value={bibText}
                                onChange={(event) => setBibText(event.target.value)}
                                minH="320px"
                                fontFamily="monospace"
                                fontSize="sm"
                                resize="vertical"
                                spellCheck={false}
                            />
                        </VStack>
                    </Box>
                    <Box borderWidth="1px" borderColor="gray.200" borderRadius="md" p={4} bg="white">
                        <VStack align="stretch" gap={3}>
                            <Text fontWeight="semibold">.bbl</Text>
                            <Textarea
                                value={bblText}
                                onChange={(event) => setBblText(event.target.value)}
                                minH="320px"
                                fontFamily="monospace"
                                fontSize="sm"
                                resize="vertical"
                                spellCheck={false}
                            />
                        </VStack>
                    </Box>
                </SimpleGrid>

                {analysis.errors.length > 0 && (
                    <Box borderWidth="1px" borderColor="red.200" borderRadius="md" bg="red.50" p={4}>
                        <VStack align="stretch" gap={2}>
                            {analysis.errors.map((error) => (
                                <Text key={`${error.offset}-${error.message}`} color="red.700">
                                    {error.message}
                                </Text>
                            ))}
                        </VStack>
                    </Box>
                )}

                <ConsistencyNotes notes={analysis.consistencyNotes} />

                <VStack align="stretch" gap={4}>
                    {analysis.groups.map((group) => (
                        <FieldPresenceTable
                            key={group.type}
                            group={group}
                            entries={entriesByType.get(group.type) ?? []}
                        />
                    ))}
                    {analysis.groups.length === 0 && (
                        <Box borderWidth="1px" borderColor="gray.200" borderRadius="md" bg="white" p={4}>
                            <Text color="gray.600">No BibTeX entries found.</Text>
                        </Box>
                    )}
                </VStack>

                <VariationSummary candidates={analysis.variationCandidates} />
            </VStack>
        </PageLayout>
    );
}
