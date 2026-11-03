import { parseSentence } from "latexlint/browser";
import { describe, it } from "vitest";


describe("checkParse", () => {
    it("should not detect errors", async () => {
        const text = "これはペンです。";
        await parseSentence(text);
    });
});
