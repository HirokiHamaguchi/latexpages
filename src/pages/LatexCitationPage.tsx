import { analyzeBibFields } from '@latexcitation/index';
import type { BibFieldGroup } from '@latexcitation/index';
import {
    Badge,
    Box,
    Heading,
    HStack,
    SimpleGrid,
    Text,
    Textarea,
    VStack,
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { FOOTER_LINK_SETS } from '../components/Footer';
import { PageLayout } from '../components/layout/PageLayout';

const SAMPLE_BIB = `@article{refA,
  author  = {A},
  title   = {Article},
  journal = {Journal},
  year    = {2000}
}

@book{refB,
  author    = {B},
  title     = {Book},
  publisher = {Publisher},
  year      = {2000}
}`;

const TYPE_COLORS = [
    { bg: '#EBF8FF', border: '#3182CE', badge: 'blue' },
    { bg: '#F0FFF4', border: '#38A169', badge: 'green' },
    { bg: '#FFFAF0', border: '#DD6B20', badge: 'orange' },
    { bg: '#FAF5FF', border: '#805AD5', badge: 'purple' },
    { bg: '#FFF5F5', border: '#E53E3E', badge: 'red' },
] as const;

function colorForType(type: string) {
    const index = Array.from(type).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return TYPE_COLORS[index % TYPE_COLORS.length];
}

function FieldPresenceTable({ group }: { group: BibFieldGroup }) {
    const color = colorForType(group.type);

    return (
        <Box
            as="section"
            borderWidth="1px"
            borderColor="gray.200"
            borderLeftWidth="4px"
            borderLeftColor={color.border}
            borderRadius="md"
            bg="white"
            overflow="hidden"
        >
            <HStack justify="space-between" px={4} py={3} bg={color.bg} borderBottomWidth="1px" borderColor="gray.200">
                <HStack gap={3}>
                    <Badge colorPalette={color.badge}>{group.type}</Badge>
                    <Text fontWeight="semibold">{group.rows.length} entries</Text>
                </HStack>
                <Text fontSize="sm" color="gray.600">
                    {group.fieldNames.length} fields
                </Text>
            </HStack>
            <Box overflowX="auto">
                <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '640px' }}>
                    <thead>
                        <tr>
                            <th style={{ borderBottom: '1px solid #E2E8F0', padding: '10px 12px', textAlign: 'left' }}>
                                key
                            </th>
                            {group.fieldNames.map((field) => (
                                <th
                                    key={field}
                                    style={{ borderBottom: '1px solid #E2E8F0', padding: '10px 12px', textAlign: 'center' }}
                                >
                                    {field}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {group.rows.map((row) => (
                            <tr key={row.key} style={{ background: color.bg }}>
                                <td style={{ borderTop: '1px solid #EDF2F7', padding: '9px 12px', fontWeight: 600 }}>
                                    {row.key}
                                </td>
                                {group.fieldNames.map((field) => (
                                    <td
                                        key={field}
                                        style={{ borderTop: '1px solid #EDF2F7', padding: '9px 12px', textAlign: 'center' }}
                                    >
                                        {row.fields[field] ? 'yes' : ''}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Box>
        </Box>
    );
}

export function LatexCitationPage() {
    const [bibText, setBibText] = useState(SAMPLE_BIB);
    const [bblText, setBblText] = useState('');
    const analysis = useMemo(() => analyzeBibFields(bibText), [bibText]);
    const bblStatus = bblText.trim() ? 'BBL provided' : 'Bib-only';

    return (
        <PageLayout
            footerLinks={FOOTER_LINK_SETS.latexcitation}
            projectKey="latexcitation"
        >
            <VStack gap={6} align="stretch">
                <VStack align="stretch" gap={1}>
                    <Heading as="h1" size="2xl" fontFamily="Times New Roman, serif">
                        LaTeX Citation
                    </Heading>
                    <Badge colorPalette="red" alignSelf="flex-start">Under Construction</Badge>
                    <Text color="gray.600">
                        Citation consistency tables for BibTeX bibliographies.
                    </Text>
                    <Badge colorPalette={bblText.trim() ? 'green' : 'gray'} alignSelf="flex-start">{bblStatus}</Badge>
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

                <VStack align="stretch" gap={4}>
                    {analysis.groups.map((group) => (
                        <FieldPresenceTable key={group.type} group={group} />
                    ))}
                    {analysis.groups.length === 0 && (
                        <Box borderWidth="1px" borderColor="gray.200" borderRadius="md" bg="white" p={4}>
                            <Text color="gray.600">No BibTeX entries found.</Text>
                        </Box>
                    )}
                </VStack>
            </VStack>
        </PageLayout>
    );
}
