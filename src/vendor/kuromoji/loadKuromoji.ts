type KuromojiStatic = Window['kuromoji'];

let kuromojiLoadPromise: Promise<KuromojiStatic> | null = null;

function getKuromojiSourcePath(): string {
    const baseUrl = import.meta.env.BASE_URL || '/';
    return `${baseUrl.replace(/\/$/, '')}/vendor/kuromoji/upstream/kuromoji.js`;
}

export async function loadKuromoji(): Promise<KuromojiStatic> {
    if (typeof window === 'undefined') {
        throw new Error('kuromoji can only be loaded in a browser environment.');
    }
    const existing = (window as Window & { kuromoji?: KuromojiStatic }).kuromoji;
    if (existing) return existing;
    if (kuromojiLoadPromise) return kuromojiLoadPromise;

    kuromojiLoadPromise = (async () => {
        const response = await fetch(getKuromojiSourcePath());
        if (!response.ok) {
            throw new Error(`Failed to fetch kuromoji.js: ${response.status} ${response.statusText}`);
        }

        const source = await response.text();
        const executeKuromoji = new Function(
            'window',
            'self',
            'globalThis',
            'define',
            'module',
            'exports',
            `${source}\nreturn window.kuromoji ?? self.kuromoji ?? globalThis.kuromoji;`
        );

        const loaded = executeKuromoji(
            window,
            window,
            globalThis,
            undefined,
            undefined,
            undefined
        ) as KuromojiStatic | undefined;

        if (!loaded) {
            kuromojiLoadPromise = null;
            throw new Error('kuromoji.js loaded but window.kuromoji is unavailable.');
        }

        (window as Window & { kuromoji?: KuromojiStatic }).kuromoji = loaded;
        return loaded;
    })().catch((error) => {
        kuromojiLoadPromise = null;
        throw error;
    });

    return kuromojiLoadPromise;
}
