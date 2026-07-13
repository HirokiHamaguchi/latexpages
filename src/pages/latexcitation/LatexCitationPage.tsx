import { analyzeBibFields, parseBib } from '@latexcitation/index';
import type { BibEntry, BibFieldGroup } from '@latexcitation/index';
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
import { PROJECT_METADATA } from '../../constants/projectMetadata';

const TYPE_COLORS = [
    { bg: '#EBF8FF', border: '#3182CE', badge: 'blue' },
    { bg: '#F0FFF4', border: '#38A169', badge: 'green' },
    { bg: '#FFFAF0', border: '#DD6B20', badge: 'orange' },
    { bg: '#FAF5FF', border: '#805AD5', badge: 'purple' },
    { bg: '#FFF5F5', border: '#E53E3E', badge: 'red' },
] as const;

const DATE_FIELDS = ['year', 'month', 'day'] as const;
const LOW_PRIORITY_FIELDS = new Set([
    'abstract',
    'archiveprefix',
    'copyright',
    'eprint',
    'file',
    'keywords',
    'langid',
    'primaryclass',
    'urldate',
]);
const BOOK_LIKE_TYPES = new Set(['book', 'inbook', 'incollection', 'proceedings']);
const VARIATION_FIELDS = ['author', 'editor', 'publisher', 'journal', 'booktitle', 'school', 'institution'];
const TABLE_CELL_PADDING = '8px 8px';
const TABLE_CELL_HORIZONTAL_PADDING = 16;
const MIN_FIELD_COLUMN_WIDTH = 40;
const MIN_KEY_COLUMN_WIDTH = 140;
const MAX_KEY_COLUMN_WIDTH = 320;
const KEY_COLUMN_VIEWPORT_RATIO = 0.3;
const TALL_TABLE_RATIO = 0.6;
const FLOATING_HEADER_TOP_SPACING = 72;
const TABLE_BAR_HEIGHT = 52;
const TABLE_HEADER_HEIGHT = 42;
const TABLE_ROW_HEIGHT = 40;
const FLOATING_HEADER_HEIGHT = TABLE_BAR_HEIGHT + TABLE_HEADER_HEIGHT;
const FLOATING_HEADER_Z_INDEX = 900;
const TABLE_OCCLUSION_Z_INDEX = 890;

type FieldColumn = 'date' | string;

type VariationCandidate = {
    field: string;
    label: string;
    values: string[];
};

type HoverPreview = {
    x: number;
    y: number;
    label: string;
    value: string;
};

type TableStickiness = {
    isTall: boolean;
    isActive: boolean;
    overlayLeft: number;
    overlayWidth: number;
    scrollLeft: number;
};

let measureTextCanvas: HTMLCanvasElement | undefined;

function colorForType(type: string) {
    const index = Array.from(type).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return TYPE_COLORS[index % TYPE_COLORS.length];
}

function getEntryYear(entry: BibEntry) {
    const year = Number.parseInt(entry.fields.year ?? '', 10);
    return Number.isFinite(year) ? year : undefined;
}

function isModernBookMissingIsbn(entry: BibEntry) {
    const year = getEntryYear(entry);
    return BOOK_LIKE_TYPES.has(entry.type) && !entry.fields.isbn && year !== undefined && year >= 1970;
}

function isPre1970BookMissingIsbn(entry: BibEntry) {
    const year = getEntryYear(entry);
    return BOOK_LIKE_TYPES.has(entry.type) && !entry.fields.isbn && year !== undefined && year < 1970;
}

function getFieldColumns(group: BibFieldGroup, showLowPriority: boolean): FieldColumn[] {
    const fieldNames = new Set(group.fieldNames);
    if (BOOK_LIKE_TYPES.has(group.type)) fieldNames.add('isbn');
    const hasDateFields = DATE_FIELDS.some((field) => fieldNames.has(field));
    const fields = Array.from(fieldNames).filter((field) => {
        if (DATE_FIELDS.includes(field as (typeof DATE_FIELDS)[number])) return false;
        return showLowPriority || !LOW_PRIORITY_FIELDS.has(field);
    });
    const titleIndex = fields.indexOf('title');
    if (!hasDateFields) return fields;
    const insertIndex = titleIndex >= 0 ? titleIndex + 1 : Math.min(3, fields.length);
    return [...fields.slice(0, insertIndex), 'date', ...fields.slice(insertIndex)];
}

function normalizeBibValue(value: string) {
    return value
        .replace(/[{}]/g, '')
        .replace(/\\[A-Za-z]+/g, '')
        .replace(/\\./g, '')
        .replace(/&/g, ' and ')
        .replace(/\b(inc|ltd|llc|co|press|publishing|publishers)\b/g, '')
        .replace(/[^A-Za-z0-9]+/g, ' ')
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase();
}

function levenshtein(left: string, right: string) {
    const costs = Array.from({ length: right.length + 1 }, (_, index) => index);
    for (let i = 1; i <= left.length; i += 1) {
        let previous = costs[0];
        costs[0] = i;
        for (let j = 1; j <= right.length; j += 1) {
            const current = costs[j];
            costs[j] = left[i - 1] === right[j - 1]
                ? previous
                : Math.min(previous, costs[j - 1], costs[j]) + 1;
            previous = current;
        }
    }
    return costs[right.length];
}

function similarity(left: string, right: string) {
    const maxLength = Math.max(left.length, right.length);
    if (maxLength === 0) return 1;
    return 1 - levenshtein(left, right) / maxLength;
}

function splitNameList(value: string) {
    return value.split(/\s+and\s+/i).map((part) => part.trim()).filter(Boolean);
}

function detectVariationCandidates(entries: BibEntry[]): VariationCandidate[] {
    const candidates: VariationCandidate[] = [];

    for (const field of VARIATION_FIELDS) {
        const values = entries.flatMap((entry) => {
            const value = entry.fields[field];
            if (!value) return [];
            return field === 'author' || field === 'editor' ? splitNameList(value) : [value];
        });
        const uniqueValues = Array.from(new Set(values));
        const byNormalized = new Map<string, Set<string>>();

        for (const value of uniqueValues) {
            const normalized = normalizeBibValue(value);
            if (!normalized) continue;
            const set = byNormalized.get(normalized) ?? new Set<string>();
            set.add(value);
            byNormalized.set(normalized, set);
        }

        for (const [normalized, originals] of byNormalized.entries()) {
            if (originals.size > 1) {
                candidates.push({ field, label: normalized, values: Array.from(originals).sort() });
            }
        }

        const normalizedValues = Array.from(byNormalized.keys());
        for (let leftIndex = 0; leftIndex < normalizedValues.length; leftIndex += 1) {
            for (let rightIndex = leftIndex + 1; rightIndex < normalizedValues.length; rightIndex += 1) {
                const left = normalizedValues[leftIndex];
                const right = normalizedValues[rightIndex];
                if (left.length < 5 || right.length < 5) continue;
                if (similarity(left, right) >= 0.88) {
                    candidates.push({
                        field,
                        label: `${left} / ${right}`,
                        values: [
                            ...Array.from(byNormalized.get(left) ?? []),
                            ...Array.from(byNormalized.get(right) ?? []),
                        ].sort(),
                    });
                }
            }
        }
    }

    return candidates.slice(0, 12);
}

function buildConsistencyNotes(groups: BibFieldGroup[], entries: BibEntry[]) {
    const notes: string[] = [];

    for (const group of groups) {
        const importantFields = group.fieldNames.filter((field) => !LOW_PRIORITY_FIELDS.has(field));
        for (const field of importantFields) {
            const presentCount = group.rows.filter((row) => row.fields[field]).length;
            if (presentCount > 0 && presentCount < group.rows.length) {
                notes.push(`@${group.type}: ${field} is present in ${presentCount}/${group.rows.length} entries.`);
            }
        }
    }

    const modernBooksMissingIsbn = entries.filter(isModernBookMissingIsbn);
    if (modernBooksMissingIsbn.length > 0) {
        notes.push(`${modernBooksMissingIsbn.length} post-1970 book-like entries are missing ISBN.`);
    }

    const partialDates = entries.filter((entry) => {
        const fields = DATE_FIELDS.filter((field) => Boolean(entry.fields[field]));
        return fields.length > 0 && !entry.fields.year;
    });
    if (partialDates.length > 0) {
        notes.push(`${partialDates.length} entries have month/day without year.`);
    }

    return notes.slice(0, 8);
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
    const presentCount = DATE_FIELDS.filter((field) => Boolean(entry.fields[field])).length;
    const label = presentCount > 0 ? '\u2713'.repeat(presentCount) : '';

    return (
        <Text as="span" fontSize="sm" letterSpacing="0" title="year / month / day">
            {label}
        </Text>
    );
}

function getPreviewValue(entry: BibEntry, column: FieldColumn) {
    if (column === 'date') {
        return DATE_FIELDS
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
    const sectionRef = useRef<HTMLDivElement | null>(null);
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const [stickiness, setStickiness] = useState<TableStickiness>({
        isTall: false,
        isActive: false,
        overlayLeft: 0,
        overlayWidth: 0,
        scrollLeft: 0,
    });

    useEffect(() => {
        const updateStickiness = () => {
            const section = sectionRef.current;
            if (!section) return;

            const rect = section.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const overlayLeft = Math.max(0, rect.left);
            const overlayRight = Math.min(window.innerWidth, rect.right);
            const isTall = rect.height > viewportHeight * TALL_TABLE_RATIO;
            const normalTop = FLOATING_HEADER_TOP_SPACING;
            const isActive = isTall
                && rect.top <= normalTop
                && rect.bottom > normalTop + FLOATING_HEADER_HEIGHT + TABLE_ROW_HEIGHT;

            setStickiness((current) => {
                const scrollLeft = scrollRef.current?.scrollLeft ?? 0;
                const overlayWidth = Math.max(0, overlayRight - overlayLeft);
                if (
                    current.isTall === isTall
                    && current.isActive === isActive
                    && current.overlayLeft === overlayLeft
                    && current.overlayWidth === overlayWidth
                    && current.scrollLeft === scrollLeft
                ) {
                    return current;
                }
                return { isTall, isActive, overlayLeft, overlayWidth, scrollLeft };
            });
        };

        const updateScrollLeft = () => {
            const scrollLeft = scrollRef.current?.scrollLeft ?? 0;
            setStickiness((current) => (
                current.scrollLeft === scrollLeft ? current : { ...current, scrollLeft }
            ));
        };

        updateStickiness();
        const scroller = scrollRef.current;
        scroller?.addEventListener('scroll', updateScrollLeft, { passive: true });
        window.addEventListener('scroll', updateStickiness, { passive: true });
        window.addEventListener('resize', updateStickiness);
        return () => {
            scroller?.removeEventListener('scroll', updateScrollLeft);
            window.removeEventListener('scroll', updateStickiness);
            window.removeEventListener('resize', updateStickiness);
        };
    }, []);

    return { sectionRef, scrollRef, stickiness };
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
    if (!stickiness.isActive || stickiness.overlayWidth <= 0) return null;

    return (
        <>
            <Box
                position="fixed"
                top={0}
                left={`${stickiness.overlayLeft}px`}
                w={`${stickiness.overlayWidth}px`}
                h={`${FLOATING_HEADER_TOP_SPACING + FLOATING_HEADER_HEIGHT}px`}
                bg="white"
                pointerEvents="none"
                zIndex={TABLE_OCCLUSION_Z_INDEX}
            />
            <Box
                position="fixed"
                top={`${FLOATING_HEADER_TOP_SPACING}px`}
                left={`${stickiness.overlayLeft}px`}
                w={`${stickiness.overlayWidth}px`}
                bg={color.bg}
                borderWidth="1px"
                borderColor="gray.200"
                borderLeftWidth="4px"
                borderLeftColor={color.border}
                borderRadius="md"
                boxShadow="md"
                overflow="hidden"
                zIndex={FLOATING_HEADER_Z_INDEX}
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
        </>
    );
}

function FieldPresenceTable({ group, entries }: { group: BibFieldGroup; entries: BibEntry[] }) {
    const [showLowPriority, setShowLowPriority] = useState(false);
    const [hoverPreview, setHoverPreview] = useState<HoverPreview | undefined>();
    const { sectionRef, scrollRef, stickiness } = useTableStickiness();
    const viewportWidth = useViewportWidth();
    const color = colorForType(group.type);
    const entryByKey = new Map(entries.map((entry) => [entry.key, entry]));
    const lowPriorityCount = group.fieldNames.filter((field) => LOW_PRIORITY_FIELDS.has(field)).length;
    const columns = getFieldColumns(group, showLowPriority);
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
            ref={sectionRef}
            as="section"
            borderWidth="1px"
            borderColor="gray.200"
            borderLeftWidth="4px"
            borderLeftColor={color.border}
            borderRadius="md"
            bg="white"
            overflow="visible"
        >
            <TableToolbar
                group={group}
                lowPriorityCount={lowPriorityCount}
                showLowPriority={showLowPriority}
                onToggleLowPriority={() => setShowLowPriority((value) => !value)}
                color={color}
            />
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
                    <thead style={{ visibility: stickiness.isActive ? 'hidden' : 'visible' }}>
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

function VariationSummary({ candidates }: { candidates: VariationCandidate[] }) {
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
    const analysis = useMemo(() => analyzeBibFields(bibText), [bibText]);
    const parsedEntries = useMemo(() => parseBib(bibText).entries, [bibText]);
    const entriesByType = useMemo(() => {
        const map = new Map<string, BibEntry[]>();
        for (const entry of parsedEntries) {
            const entries = map.get(entry.type) ?? [];
            entries.push(entry);
            map.set(entry.type, entries);
        }
        return map;
    }, [parsedEntries]);
    const consistencyNotes = useMemo(() => buildConsistencyNotes(analysis.groups, parsedEntries), [analysis.groups, parsedEntries]);
    const variationCandidates = useMemo(() => detectVariationCandidates(parsedEntries), [parsedEntries]);
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

                <ConsistencyNotes notes={consistencyNotes} />

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

                <VariationSummary candidates={variationCandidates} />
            </VStack>
        </PageLayout>
    );
}
