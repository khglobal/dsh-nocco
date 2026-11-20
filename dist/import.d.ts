/** How many rows of each table the model is shown; every row goes to the data file. */
export declare const SAMPLE_ROWS = 5;
/** How much of a document's text the model is shown. */
export declare const TEXT_LIMIT = 20000;
/** Where a table file's rows are saved inside an app, relative to the app. */
export declare const IMPORT_FOLDER: string;
export type ColumnType = 'text' | 'number' | 'date' | 'boolean' | 'empty';
export type Cell = string | number | boolean | null;
export type TableColumn = {
    name: string;
    type: ColumnType;
    blanks: number;
};
export type TableSummary = {
    name: string;
    rowCount: number;
    columns: TableColumn[];
    sample: Record<string, Cell>[];
};
export type ImportedTable = TableSummary & {
    rows: Record<string, Cell>[];
};
export type ImportResult = {
    kind: 'tables';
    source: string;
    tables: TableSummary[];
    dataFile?: string;
} | {
    kind: 'document';
    source: string;
    text: string;
    length: number;
    truncated: boolean;
};
/**
 * Turn a grid of cells into a table: the first row that has content names the
 * columns, the rows after it become records, and rows with no content are dropped.
 */
export declare function toTable(name: string, grid: readonly (readonly unknown[])[]): ImportedTable;
/**
 * Read a file the user wants the system built from.
 *
 * A table file (Excel, CSV, TSV) is described by its columns and a few rows;
 * when `directory` names an app, every row is also saved to a JSON file inside
 * it, so the rows reach the database without passing through the model. A
 * document (Word, Markdown, text) is returned as text.
 */
export declare function importFile(options: {
    file: string;
    directory?: string;
    inside?: (path: string) => Promise<void>;
}): Promise<ImportResult>;
