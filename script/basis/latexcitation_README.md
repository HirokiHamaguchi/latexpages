# LaTeX Citation

LaTeX Citation is an experimental citation consistency checker for LaTeX projects that visualizes BibTeX field usage.

The current prototype focuses on the case where a `.bib` file is available but a `.bbl` file is not. It parses BibTeX entries, groups them by entry type, and shows which fields are present in each item. This is intended to make inconsistent metadata easier to notice. For example, if several `@book` entries exist and only some of them have `publisher`, the table makes that difference visible.

This page is still under construction. The current output is only a field-presence table; it does not yet decide whether an entry is wrong or incomplete.

## Current Behavior

- Input 1: the contents of a `.bib` file.
- Input 2: the contents of a `.bbl` file.
- If `.bbl` content is absent, the page performs a `.bib`-only inspection.
- Entries are grouped by BibTeX entry type.
- Rows are sorted by entry type and citation key.
- Columns are sorted with common fields first, such as `author`, `editor`, `title`, `journal`, `booktitle`, `publisher`, and `year`.

## BibTeX Format Notes

BibTeX stores bibliography data in `.bib` files. A typical entry has three main parts:

- An entry type, such as `@article`, `@book`, or `@inproceedings`.
- A citation key that uniquely identifies the entry.
- A list of fields written as key-value pairs.

Field names are case-insensitive in ordinary BibTeX usage. Field values are often enclosed in braces or double quotes, and plain numeric values such as years are also common.

Common entry types include `article`, `book`, `booklet`, `conference`, `inbook`, `incollection`, `inproceedings`, `manual`, `masterthesis`, `misc`, `phdthesis`, `proceedings`, `techreport`, and `unpublished`.

Common standard fields include `address`, `annote`, `author`, `booktitle`, `chapter`, `edition`, `editor`, `howpublished`, `institution`, `journal`, `month`, `note`, `number`, `organization`, `pages`, `publisher`, `school`, `series`, `title`, `type`, `volume`, and `year`.

Common non-standard fields include `doi`, `issn`, `isbn`, and `url`. These are widely used, but support can depend on the BibTeX style.

Source: [BibTeX.com: A complete guide to the BibTeX format](https://www.bibtex.com/g/bibtex-format/)

## ISBN

ISBN means International Standard Book Number. It is a numeric identifier for books and book-like publications. Modern ISBNs have 13 digits, while older ISBNs may have 10 digits. Different editions or formats of the same work, such as hardcover and ebook versions, can have different ISBNs.

Source: [Wikipedia: ISBN](https://en.wikipedia.org/wiki/ISBN)

## ISSN

ISSN means International Standard Serial Number. It is an eight-digit identifier for serial publications such as journals, magazines, and continuing series. Print and electronic versions of the same serial can have different ISSNs.

Source: [Wikipedia: ISSN](https://en.wikipedia.org/wiki/ISSN)

## Planned Ideas

- Compare `.bib` entries with `.bbl` output.
- Highlight fields that are present for some entries of the same type but absent for others.
- Explain identifiers such as ISBN, ISSN, DOI, and URLs.
- Add entry-type-specific expectations after the table view is stable.
