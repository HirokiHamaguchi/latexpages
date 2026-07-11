import { Box, HStack, Image, Text } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { BASE_URL } from '../constants/app';
import { PROJECT_HEADER_CONFIGS, ROUTES } from '../constants/routes';
import type { NavItem } from '../constants/routes';

type TopNavHeaderProps = {
    navItems?: readonly NavItem[];
    pageLabel?: string;
    projectHomePath?: string;
};

export function TopNavHeader({
    navItems = PROJECT_HEADER_CONFIGS.latexlint.navItems,
    pageLabel = 'LaTeX Lint',
    projectHomePath = ROUTES.LATEXLINT,
}: TopNavHeaderProps) {
    const location = useLocation();
    const hasNavItems = navItems.length > 0;

    const isActive = (path: string) => {
        if (path === ROUTES.LATEXLINT_README) {
            return location.pathname === ROUTES.LATEXLINT_README || location.pathname.startsWith(`${ROUTES.LATEXLINT_README}/`);
        }
        if (path === ROUTES.LATEXCITATION_README) {
            return location.pathname === ROUTES.LATEXCITATION_README || location.pathname.startsWith(`${ROUTES.LATEXCITATION_README}/`);
        }
        return location.pathname === path;
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
            py={1}
            px={4}
            backdropFilter="blur(8px)"
            width="100%"
        >
            <Box overflowX="auto" overflowY="hidden" py={1} css={{ scrollbarWidth: 'thin' }}>
                <HStack
                    gap={4}
                    justify="flex-start"
                    flexWrap="nowrap"
                    whiteSpace="nowrap"
                    width="max-content"
                    minW="max-content"
                    minH="2.25rem"
                >
                    {/* Logo + current page label */}
                    <Box display="flex" alignItems="center" gap={1.5} h="2.25rem" flexShrink={0}>
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
                            <Text fontWeight="semibold" fontFamily="Times New Roman, serif">
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
                            px={3}
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
                            <RouterLink to={item.path}>{item.label}</RouterLink>
                        </Box>
                    ))}
                </HStack>
            </Box>
        </Box>
    );
}
