import { Box, HStack, Image, Text } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { PROJECTS } from '../app/projects/projectRegistry';
import type { NavItem } from '../app/projects/projectRegistry';
import { BASE_URL } from '../constants/app';
import { ROUTES } from '../constants/routes';

type TopNavHeaderProps = {
    navItems?: readonly NavItem[];
    pageLabel?: string;
    projectHomePath?: string;
};

export const TOP_NAV_HEADER_HEIGHT = 56;

export function TopNavHeader({
    navItems = PROJECTS.latexlint.navItems,
    pageLabel = 'LaTeX Lint',
    projectHomePath = ROUTES.LATEXLINT,
}: TopNavHeaderProps) {
    const location = useLocation();
    const hasNavItems = navItems.length > 0;
    const currentPath = normalizePath(location.pathname);

    const isActive = (path: string) => {
        const targetPath = normalizePath(path);
        if (targetPath.endsWith('/readme')) {
            return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
        }
        return currentPath === targetPath;
    };

    return (
        <Box
            as="nav"
            aria-label="Primary page navigation"
            position="sticky"
            top={0}
            zIndex="sticky"
            bg="whiteAlpha.900"
            borderBottomWidth="1px"
            borderColor="gray.200"
            h={`${TOP_NAV_HEADER_HEIGHT}px`}
            py={1}
            px={{ base: 1.5, sm: 2, md: 4 }}
            backdropFilter="blur(8px)"
            width="100%"
        >
            <Box overflowX="auto" overflowY="hidden" py={1} css={{ scrollbarWidth: 'thin' }}>
                <HStack
                    gap={{ base: 1.5, sm: 2, md: 4 }}
                    justify="flex-start"
                    flexWrap="nowrap"
                    whiteSpace="nowrap"
                    width="max-content"
                    minW="max-content"
                    minH="2.25rem"
                >
                    {/* Logo + current page label */}
                    <Box display="flex" alignItems="center" gap={{ base: 1, md: 1.5 }} h="2.25rem" flexShrink={0}>
                        <Box
                            asChild
                            display="inline-flex"
                            alignItems="center"
                            h="2rem"
                            lineHeight="1"
                        >
                            <RouterLink to={ROUTES.HUB} aria-label="Go to LaTeX Pages">
                            <Image
                                src={`${BASE_URL}lintIconLight_copied.svg`}
                                alt="LaTeX Pages Icon"
                                boxSize="1.5rem"
                            />
                            </RouterLink>
                        </Box>
                        {projectHomePath ? (
                            <>
                                <svg
                                    aria-hidden="true"
                                    width="0.35rem"
                                    height="0.7rem"
                                    viewBox="0 0 6 10"
                                    style={{ color: '#A0AEC0' }}
                                >
                                    <polyline
                                        points="1 1 5 5 1 9"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <Box
                                    asChild
                                    display="inline-flex"
                                    alignItems="center"
                                    h="2rem"
                                    fontWeight="semibold"
                                    fontFamily="Times New Roman, serif"
                                    lineHeight="1"
                                    color="gray.800"
                                    _hover={{ color: 'blue.700', textDecoration: 'none' }}
                                >
                                    <RouterLink to={projectHomePath}>{pageLabel}</RouterLink>
                                </Box>
                            </>
                        ) : (
                            <Text
                                display="inline-flex"
                                alignItems="center"
                                h="2rem"
                                fontWeight="semibold"
                                fontFamily="Times New Roman, serif"
                                lineHeight="1"
                            >
                                {pageLabel}
                            </Text>
                        )}
                    </Box>

                    {/* Divider */}
                    {hasNavItems && (
                        <Box
                            width="1px"
                            height="1.5rem"
                            bg="gray.300"
                            flexShrink={0}
                        />
                    )}
                    {/* Nav items */}
                    {navItems.map((item) => (
                        <Box
                            key={item.path}
                            asChild
                            display="inline-flex"
                            alignItems="center"
                            flexShrink={0}
                            h="2rem"
                            borderRadius="md"
                            px={{ base: 1.5, sm: 2, md: 3 }}
                            fontSize="sm"
                            lineHeight="1"
                            fontWeight={isActive(item.path) ? 'semibold' : 'medium'}
                            bg={isActive(item.path) ? 'blue.50' : 'transparent'}
                            color={isActive(item.path) ? 'blue.700' : 'gray.700'}
                            borderWidth="1px"
                            borderColor={isActive(item.path) ? 'blue.200' : 'transparent'}
                            _hover={{
                                textDecoration: 'none',
                                bg: isActive(item.path) ? 'blue.50' : 'gray.100',
                            }}
                            transition="all 0.2s"
                        >
                            <RouterLink to={item.path} aria-current={isActive(item.path) ? 'page' : undefined}>{item.label}</RouterLink>
                        </Box>
                    ))}
                </HStack>
            </Box>
        </Box>
    );
}

function normalizePath(path: string) {
    if (path === ROUTES.HUB) return path;
    return path.replace(/\/+$/, '');
}
