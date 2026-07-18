import {
    analyzeBibDocument,
    BIB_DATE_FIELDS,
    getBibFieldColumns,
    isLowPriorityBibField,
    isModernBookMissingIsbn,
    isPre1970BookMissingIsbn,
} from '@latexcitation/index';
import type { BibEntry, BibFieldGroup, BibVariationCandidate } from '@latexcitation/index';
import {
    Badge,
    Box,
    Button,
    HStack,
    SimpleGrid,
    Text,
    Textarea,
    VStack,
} from '@chakra-ui/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import defaultBibText from '../../assets/default-latexcitation.bib?raw';
import { FOOTER_LINK_SETS } from '../../components/Footer';
import { Hero } from '../../components/hero/Hero';
import { PageLayout } from '../../components/layout/PageLayout';
import { TOP_NAV_HEADER_HEIGHT } from '../../components/TopNavHeader';
import { PROJECT_METADATA } from '../../constants/projectMetadata';

const TYPE_COLORS = [
    { bg: '#EBF8FF', border: '#3182CE', badge: 'blue' },
    { bg: '#F0FFF4', border: '#38A169', badge: 'green' },
    { bg: '#FFFAF0', border: '#DD6B20', badge: 'orange' },
    { bg: '#FAF5FF', border: '#805AD5', badge: 'purple' },
    { bg: '#FFF5F5', border: '#E53E3E', badge: 'red' },
] as const;
const TABLE_CELL_PADDING = '8px 8px';
const TABLE_CELL_HORIZONTAL_PADDING = 16;
const MIN_FIELD_COLUMN_WIDTH = 40;
const MIN_KEY_COLUMN_WIDTH = 140;
const MAX_KEY_COLUMN_WIDTH = 320;
const KEY_COLUMN_VIEWPORT_RATIO = 0.3;
const FIELD_TABLE_STACK_GAP = 16;
const FLOATING_HEADER_CORNER_RADIUS = 6;
const FLOATING_HEADER_TOP_SPACING = TOP_NAV_HEADER_HEIGHT + FIELD_TABLE_STACK_GAP;
const FLOATING_HEADER_MASK_TOP_OFFSET = -FIELD_TABLE_STACK_GAP;
const FLOATING_HEADER_MASK_HEIGHT = FIELD_TABLE_STACK_GAP + FLOATING_HEADER_CORNER_RADIUS;
const TABLE_BAR_HEIGHT = 52;
const TABLE_HEADER_HEIGHT = 42;
const FLOATING_HEADER_Z_INDEX = 900;

type FieldColumn = 'date' | string;

type HoverPreview = {
    x: number;
    y: number;
    label: string;
    value: string;
};

type TableStickiness = {
    scrollLeft: number;
};

let measureTextCanvas: HTMLCanvasElement | undefined;

function colorForType(type: string) {
    const index = Array.from(type).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return TYPE_COLORS[index % TYPE_COLORS.length];
}

function FieldCell({ entry, field }: { entry: BibEntry; field: string }) {
    if (field === 'isbn' && isModernBookMissingIsbn(entry)) {
        return <Text as="span" color="orange.700" fontWeight="bold" title="Post-1970 book-like entry without ISBN">!</Text>;
    }
    if (field === 'isbn' && isPre1970BookMissingIsbn(entry)) {
        return <Text as="span" color="gray.500" title="Pre-1970 book-like entry; ISBN may not exist">n/a</Text>;
    }
    return entry.fields[field] ? <Text as="span">{'\u2713'}</Text> : null;
}

function DateCell({ entry }: { entry: BibEntry }) {
    const presentCount = BIB_DATE_FIELDS.filter((field) => Boolean(entry.fields[field])).length;
    const label = presentCount > 0 ? '\u2713'.repeat(presentCount) : '';

    return (
        <Text as="span" fontSize="sm" letterSpacing="0" title="year / month / day">
            {label}
        </Text>
    );
}

function getPreviewValue(entry: BibEntry, column: FieldColumn) {
    if (column === 'date') {
        return BIB_DATE_FIELDS
            .map((field) => `${field}: ${entry.fields[field] || '-'}`)
            .join('\n');
    }
    if (column === 'isbn' && isModernBookMissingIsbn(entry)) {
        return 'Missing ISBN. This is a post-1970 book-like entry, so an ISBN is often expected.';
    }
    if (column === 'isbn' && isPre1970BookMissingIsbn(entry)) {
        return 'Missing ISBN. This is a pre-1970 book-like entry, so absence may be normal.';
    }
    return entry.fields[column] || '(missing)';
}

function makeCellStyle(extra: React.CSSProperties = {}): React.CSSProperties {
    return {
        borderTop: '1px solid #EDF2F7',
        padding: TABLE_CELL_PADDING,
        textAlign: 'center',
        backgroundClip: 'padding-box',
        ...extra,
    };
}

function makeHeaderCellStyle(extra: React.CSSProperties = {}): React.CSSProperties {
    return {
        borderBottom: '1px solid #E2E8F0',
        padding: TABLE_CELL_PADDING,
        fontWeight: 700,
        boxSizing: 'border-box',
        ...extra,
    };
}

function measureTextWidth(text: string) {
    if (typeof document === 'undefined') return text.length * 8;
    measureTextCanvas ??= document.createElement('canvas');
    const context = measureTextCanvas.getContext('2d');
    if (!context) return text.length * 8;
    context.font = '700 16px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    return context.measureText(text).width;
}

function computeFieldColumnWidth(column: FieldColumn) {
    const label = column === 'date' ? 'date' : column;
    return Math.ceil(Math.max(
        MIN_FIELD_COLUMN_WIDTH,
        measureTextWidth(label) + TABLE_CELL_HORIZONTAL_PADDING,
    ));
}

function computeKeyColumnWidth(viewportWidth: number) {
    return Math.round(Math.min(
        MAX_KEY_COLUMN_WIDTH,
        Math.max(MIN_KEY_COLUMN_WIDTH, viewportWidth * KEY_COLUMN_VIEWPORT_RATIO),
    ));
}

function useViewportWidth() {
    const [viewportWidth, setViewportWidth] = useState(() => (
        typeof window === 'undefined' ? 390 : window.innerWidth
    ));

    useEffect(() => {
        const updateViewportWidth = () => setViewportWidth(window.innerWidth);
        window.addEventListener('resize', updateViewportWidth);
        return () => window.removeEventListener('resize', updateViewportWidth);
    }, []);

    return viewportWidth;
}

function useTableStickiness() {
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const [stickiness, setStickiness] = useState<TableStickiness>({
        scrollLeft: 0,
    });

    useEffect(() => {
        const updateScrollLeft = () => {
            const scrollLeft = scrollRef.current?.scrollLeft ?? 0;
            setStickiness((current) => (
                current.scrollLeft === scrollLeft ? current : { ...current, scrollLeft }
            ));
        };

        updateScrollLeft();
        const scroller = scrollRef.current;
        scroller?.addEventListener('scroll', updateScrollLeft, { passive: true });
        return () => {
            scroller?.removeEventListener('scroll', updateScrollLeft);
        };
    }, []);

    return { scrollRef, stickiness };
}

function TableToolbar({
    group,
    lowPriorityCount,
    showLowPriority,
    onToggleLowPriority,
    color,
}: {
    group: BibFieldGroup;
    lowPriorityCount: number;
    showLowPriority: boolean;
    onToggleLowPriority: () => void;
    color: (typeof TYPE_COLORS)[number];
}) {
    return (
        <HStack
            justify="space-between"
            px={4}
            py={3}
            bg={color.bg}
            borderBottomWidth="1px"
            borderColor="gray.200"
            minH={`${TABLE_BAR_HEIGHT}px`}
        >
            <HStack gap={3}>
                <Badge colorPalette={color.badge}>{group.type}</Badge>
                <Text fontWeight="semibold">{group.rows.length} entries</Text>
            </HStack>
            <HStack gap={3}>
                <Text fontSize="sm" color="gray.600">
                    {group.fieldNames.length} fields
                </Text>
                {lowPriorityCount > 0 && (
                    <Button size="xs" variant="outline" onClick={onToggleLowPriority}>
                        {showLowPriority ? 'Hide low-priority' : `Show ${lowPriorityCount} low-priority`}
                    </Button>
                )}
            </HStack>
        </HStack>
    );
}

function FloatingTableHeader({
    group,
    columns,
    columnWidths,
    keyColumnWidth,
    lowPriorityCount,
    showLowPriority,
    onToggleLowPriority,
    color,
    stickiness,
}: {
    group: BibFieldGroup;
    columns: FieldColumn[];
    columnWidths: number[];
    keyColumnWidth: number;
    lowPriorityCount: number;
    showLowPriority: boolean;
    onToggleLowPriority: () => void;
    color: (typeof TYPE_COLORS)[number];
    stickiness: TableStickiness;
}) {
    return (
        <>
            <Box
                position="sticky"
                top={`${FLOATING_HEADER_TOP_SPACING}px`}
                zIndex={FLOATING_HEADER_Z_INDEX}
            >
                {/* The sticky mask covers exactly the inter-table gap: its top edge aligns with the page header bottom,
                    its distance to the floating header top matches the previous table's bottom gap, and its bottom
                    extends one header corner radius below the floating header top to preserve the rounded corners. */}
                <Box
                    position="absolute"
                    top={`${FLOATING_HEADER_MASK_TOP_OFFSET}px`}
                    left="-0.5%"
                    w="101%"
                    h={`${FLOATING_HEADER_MASK_HEIGHT}px`}
                    bg="white"
                    pointerEvents="none"
                    zIndex={0}
                    aria-hidden="true"
                />
                <Box
                    position="relative"
                    ml="-4px"
                    bg={color.bg}
                    borderLeftWidth="4px"
                    borderLeftColor={color.border}
                    borderTopLeftRadius={`${FLOATING_HEADER_CORNER_RADIUS}px`}
                    borderTopRightRadius={`${FLOATING_HEADER_CORNER_RADIUS}px`}
                    boxShadow="sm"
                    overflow="hidden"
                    zIndex={1}
                >
                    <TableToolbar
                        group={group}
                        lowPriorityCount={lowPriorityCount}
                        showLowPriority={showLowPriority}
                        onToggleLowPriority={onToggleLowPriority}
                        color={color}
                    />
                    <Box position="relative" h={`${TABLE_HEADER_HEIGHT}px`} overflow="hidden" bg={color.bg}>
                    <Box
                        position="absolute"
                        left={0}
                        top={0}
                        w={`${keyColumnWidth}px`}
                        h="full"
                        display="flex"
                        alignItems="center"
                        borderRightWidth="1px"
                        bg={color.bg}
                        zIndex={2}
                        style={makeHeaderCellStyle({ textAlign: 'left', borderColor: '#E2E8F0' })}
                    >
                        key
                    </Box>
                    <HStack
                        position="absolute"
                        left={`${keyColumnWidth}px`}
                        top={0}
                        h="full"
                        gap={0}
                        transform={`translateX(-${stickiness.scrollLeft}px)`}
                        transition="none"
                    >
                        {columns.map((field, index) => (
                            <Box
                                key={field}
                                w={`${columnWidths[index]}px`}
                                h="full"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                flexShrink={0}
                                style={makeHeaderCellStyle({ textAlign: 'center' })}
                            >
                                {field === 'date' ? 'date' : field}
                            </Box>
                        ))}
                    </HStack>
                    </Box>
                </Box>
            </Box>
        </>
    );
}

function FieldPresenceTable({ group, entries }: { group: BibFieldGroup; entries: BibEntry[] }) {
    const [showLowPriority, setShowLowPriority] = useState(false);
    const [hoverPreview, setHoverPreview] = useState<HoverPreview | undefined>();
    const { scrollRef, stickiness } = useTableStickiness();
    const viewportWidth = useViewportWidth();
    const color = colorForType(group.type);
    const entryByKey = new Map(entries.map((entry) => [entry.key, entry]));
    const lowPriorityCount = group.fieldNames.filter((field) => isLowPriorityBibField(field)).length;
    const columns = getBibFieldColumns(group, showLowPriority);
    const columnWidths = columns.map(computeFieldColumnWidth);
    const keyColumnWidth = computeKeyColumnWidth(viewportWidth);
    const tableWidth = keyColumnWidth + columnWidths.reduce((sum, width) => sum + width, 0);
    const showPreview = (event: React.MouseEvent<HTMLElement>, label: string, value: string) => {
        setHoverPreview({
            x: Math.min(event.clientX + 14, window.innerWidth - 440),
            y: Math.min(event.clientY + 14, window.innerHeight - 240),
            label,
            value,
        });
    };

    return (
        <Box
            as="section"
            borderWidth="1px"
            borderColor="gray.200"
            borderLeftWidth="4px"
            borderLeftColor={color.border}
            borderRadius="md"
            bg="white"
            overflow="visible"
        >
            <FloatingTableHeader
                group={group}
                columns={columns}
                columnWidths={columnWidths}
                keyColumnWidth={keyColumnWidth}
                lowPriorityCount={lowPriorityCount}
                showLowPriority={showLowPriority}
                onToggleLowPriority={() => setShowLowPriority((value) => !value)}
                color={color}
                stickiness={stickiness}
            />
            <Box ref={scrollRef} overflowX="auto" position="relative">
                <table style={{ borderCollapse: 'separate', borderSpacing: 0, tableLayout: 'fixed', width: `${tableWidth}px` }}>
                    <colgroup>
                        <col style={{ width: `${keyColumnWidth}px` }} />
                        {columns.map((field, index) => (
                            <col key={field} style={{ width: `${columnWidths[index]}px` }} />
                        ))}
                    </colgroup>
                    <thead style={{ display: 'none' }}>
                        <tr>
                            <th style={makeHeaderCellStyle({ textAlign: 'left', position: 'sticky', left: 0, zIndex: 5, background: color.bg, width: `${keyColumnWidth}px` })}>
                                key
                            </th>
                            {columns.map((field, index) => (
                                <th
                                    key={field}
                                    style={makeHeaderCellStyle({ textAlign: 'center', background: color.bg, width: `${columnWidths[index]}px` })}
                                >
                                    {field === 'date' ? 'date' : field}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {group.rows.map((row) => {
                            const entry = entryByKey.get(row.key);
                            if (!entry) return null;
                            return (
                                <tr key={row.key} style={{ background: color.bg }}>
                                    <td
                                        style={makeCellStyle({ textAlign: 'left', fontWeight: 600, position: 'sticky', left: 0, zIndex: 2, background: color.bg, width: `${keyColumnWidth}px`, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' })}
                                        onMouseEnter={(event) => showPreview(event, 'entry', `@${entry.type}{${entry.key}}`)}
                                        onMouseMove={(event) => showPreview(event, 'entry', `@${entry.type}{${entry.key}}`)}
                                        onMouseLeave={() => setHoverPreview(undefined)}
                                    >
                                        {row.key}
                                    </td>
                                    {columns.map((field) => (
                                        <td
                                            key={field}
                                            style={makeCellStyle()}
                                            onMouseEnter={(event) => showPreview(event, field === 'date' ? 'year / month / day' : field, getPreviewValue(entry, field))}
                                            onMouseMove={(event) => showPreview(event, field === 'date' ? 'year / month / day' : field, getPreviewValue(entry, field))}
                                            onMouseLeave={() => setHoverPreview(undefined)}
                                        >
                                            {field === 'date' ? <DateCell entry={entry} /> : <FieldCell entry={entry} field={field} />}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {hoverPreview && (
                    <Box
                        position="fixed"
                        left={`${hoverPreview.x}px`}
                        top={`${hoverPreview.y}px`}
                        maxW="420px"
                        maxH="220px"
                        overflowY="auto"
                        p={3}
                        bg="rgba(26, 32, 44, 0.92)"
                        color="white"
                        borderRadius="md"
                        boxShadow="lg"
                        pointerEvents="none"
                        zIndex={1000}
                    >
                        <Text fontSize="xs" fontWeight="semibold" color="gray.200" mb={1}>
                            {hoverPreview.label}
                        </Text>
                        <Box as="pre" m={0} fontSize="xs" whiteSpace="pre-wrap" fontFamily="monospace">
                            {hoverPreview.value}
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

function ConsistencyNotes({ notes }: { notes: string[] }) {
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

function VariationSummary({ candidates }: { candidates: BibVariationCandidate[] }) {
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
        <PageLayout
            footerLinks={FOOTER_LINK_SETS.latexcitation}
            projectKey="latexcitation"
        >
            <VStack gap={6} align="stretch">
                <VStack align="stretch" gap={1}>
                    <Hero
                        label={PROJECT_METADATA.latexcitation.label}
                        subtitle={PROJECT_METADATA.latexcitation.description}
                        iconAlt={PROJECT_METADATA.latexcitation.label}
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
