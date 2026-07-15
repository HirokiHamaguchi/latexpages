import Markdown from 'react-markdown';
import { Link as RouterLink } from 'react-router-dom';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkSlug from 'remark-slug';
import { ROUTES } from '../../constants/routes';
import { GITHUB_RAW_BASE } from './constants';

type ReadmeMarkdownProps = {
    content: string;
    routeBase?: string;
};

export function ReadmeMarkdown({ content, routeBase = ROUTES.LATEXLINT_README }: ReadmeMarkdownProps) {
    return (
        <Markdown
            // @ts-expect-error: Type '() => void | Transformer<Root, Root>' is not assignable to type 'Pluggable'.
            remarkPlugins={[remarkGfm, remarkSlug]}
            rehypePlugins={[rehypeRaw]}
            components={{
                ol: ({ children, ...props }) => (
                    <ol {...props} style={{ ...props.style, listStyleType: 'decimal', paddingLeft: '2em' }}>
                        {children}
                    </ol>
                ),
                a: ({ href, children, ...props }) => {
                    if (href?.startsWith('#')) {
                        return <RouterLink {...props} to={`${routeBase}/${href.slice(1)}`}>{children}</RouterLink>;
                    }

                    return <a {...props} href={href}>{children}</a>;
                },
                img: ({ src, ...props }) => {
                    const resolvedSrc = src?.startsWith('http') ? src : `${GITHUB_RAW_BASE}${src}`;
                    if ('width' in props) return <img {...props} src={resolvedSrc} />;
                    return (
                        <span style={{ display: 'flex', justifyContent: 'center', margin: '1em 0' }}>
                            <img {...props} src={resolvedSrc} style={{ maxWidth: '70%' }} />
                        </span>
                    );
                },
            }}
        >
            {content}
        </Markdown>
    );
}
