import {
    Box,
    HStack,
    Image,
    Link,
    Text,
    VStack
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { PROJECTS } from '../app/projects/projectRegistry';
import type { FooterLinkItem } from '../app/projects/projectRegistry';

const BASE_URL = import.meta.env.BASE_URL;
export const FOOTER_LINK_SETS = Object.fromEntries(
    Object.entries(PROJECTS).map(([projectKey, project]) => [projectKey, [...project.footerLinks]])
) satisfies Record<string, FooterLinkItem[]>;

const DEFAULT_FOOTER_LINKS = [...PROJECTS.latexpages.footerLinks];

const LinkContent = ({ children, icon, roundIcon }: { children: React.ReactNode; icon: string; roundIcon?: boolean }) => (
    <HStack align="center" gap={2}>
        <Image src={`${BASE_URL}${icon}`} alt="" boxSize="1.8em" borderRadius={roundIcon ? "full" : undefined} />
        <Text fontSize="sm">{children}</Text>
    </HStack>
);

const FooterLink = ({ item }: { item: FooterLinkItem }) => {
    if (item.to) {
        return (
            <Link asChild>
                <RouterLink to={item.to}>
                    <LinkContent icon={item.icon} roundIcon={item.roundIcon}>
                        {item.label}
                    </LinkContent>
                </RouterLink>
            </Link>
        );
    }

    return (
        <Link
            href={item.href}
            target={item.reload ? undefined : '_blank'}
            rel={item.reload ? undefined : 'noopener noreferrer'}
        >
            <LinkContent icon={item.icon} roundIcon={item.roundIcon}>
                {item.label}
            </LinkContent>
        </Link>
    );
};

export function Footer({ links = DEFAULT_FOOTER_LINKS }: { links?: FooterLinkItem[] }) {
    return (
        <Box
            as="footer"
            py={4}
            px={6}
        >
            <VStack gap={3}>
                <HStack gap={5} flexWrap="wrap" justifyContent="center">
                    {links.map((link) => (
                        <FooterLink key={`${link.href ?? link.to}-${link.label}`} item={link} />
                    ))}
                </HStack>
                <Text fontSize="xs" color="gray.600">
                    © 2026 Hiroki Hamaguchi. All rights reserved.
                </Text>
            </VStack>
        </Box>
    );
}
