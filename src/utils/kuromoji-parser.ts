interface KuromojiToken {
  word_id: number;
  word_type: "KNOWN" | "UNKNOWN";
  surface_form: string;
  pos: string;
  pos_detail_1: string;
  pos_detail_2: string;
  pos_detail_3: string;
  conjugated_type: string;
  conjugated_form: string;
  basic_form: string;
  reading: string;
  pronunciation: string;
}

interface Tokenizer {
  tokenize(text: string): KuromojiToken[];
}

interface Builder {
  build(callback: (err: Error | null, tokenizer: Tokenizer) => void): void;
}

interface KuromojiStatic {
  builder(options: { dicPath: string }): Builder;
}

declare global {
  interface Window {
    kuromoji: KuromojiStatic;
  }
}

export interface Token extends KuromojiToken {
  word_position: number;
  range: [number, number];
}

let tokenizerCache: Tokenizer | null = null;
let tokenizerPromise: Promise<Tokenizer> | null = null;

function getKuromojiDictPath(): string {
  const script = document.querySelector<HTMLScriptElement>('script[src$="kuromoji.js"]');
  if (!script?.src) return "dict";

  const dictUrl = new URL("dict", script.src);
  return dictUrl.pathname;
}

async function getTokenizer(): Promise<Tokenizer> {
  if (tokenizerCache) return tokenizerCache;
  if (tokenizerPromise) return tokenizerPromise;

  tokenizerPromise = new Promise((resolve, reject) => {
    const dicPath = getKuromojiDictPath();
    window.kuromoji.builder({ dicPath }).build((err, tokenizer) => {
      if (err) {
        reject(err);
        return;
      }
      tokenizerCache = tokenizer;
      resolve(tokenizer);
    });
  });

  return tokenizerPromise;
}

export async function parseSentence(text: string): Promise<Token[]> {
  const tokenizer = await getTokenizer();

  if (!text) return [];
  const kuromojiTokens = tokenizer.tokenize(text);

  const tokens: Token[] = [];
  let position = 0;

  for (const kuromojiToken of kuromojiTokens) {
    const len = kuromojiToken.surface_form.length;
    tokens.push({
      ...kuromojiToken,
      word_position: position + 1,
      range: [position, position + len],
    });
    position += len;
  }

  return tokens;
}
