import {
    Box,
    HStack,
    Image,
    Link,
    Text,
    VStack
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const BASE_URL = import.meta.env.BASE_URL;

export type FooterLinkItem = {
    icon: string;
    label: string;
    href?: string;
    to?: string;
    roundIcon?: boolean;
};

export const FOOTER_LINK_SETS = {
    latexpages: [
        {
            to: ROUTES.HUB,
            icon: 'lintIconLight_copied.svg',
            label: 'Project Page',
        },
        {
            href: 'https://github.com/HirokiHamaguchi/latexpages',
            icon: 'mark-github-24.svg',
            label: 'GitHub Repository',
        },
        {
            href: 'https://hirokihamaguchi.github.io/',
            icon: 'profile_icon256.webp',
            label: "Developer's Website",
            roundIcon: true,
        },
    ],
    latexlint: [
        {
            to: ROUTES.LATEXLINT,
            icon: 'lintIconLight_copied.svg',
            label: 'Project Page',
        },
        {
            href: 'https://github.com/HirokiHamaguchi/latexlint/tree/master',
            icon: 'mark-github-24.svg',
            label: 'GitHub Repository',
        },
        {
            href: 'https://marketplace.visualstudio.com/items?itemName=hari64boli64.latexlint',
            icon: 'Visual_Studio_Code_1.35_icon.svg',
            label: 'VS Code Extension',
        },
    ],
} satisfies Record<string, FooterLinkItem[]>;

const DEFAULT_FOOTER_LINKS = FOOTER_LINK_SETS.latexpages;

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
        <Link href={item.href} target="_blank" rel="noopener noreferrer">
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
                        <FooterLink key={link.href ?? link.to} item={link} />
                    ))}
                </HStack>
                <Text fontSize="xs" color="gray.600">
                    © 2026 Hiroki Hamaguchi. All rights reserved.
                </Text>
            </VStack>
        </Box>
    );
}
