import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, extname, isAbsolute, join } from 'node:path';

/** How many rows of each table the model is shown; every row goes to the data file. */
export const SAMPLE_ROWS = 5;
/** How much of a document's text the model is shown. */
export const TEXT_LIMIT = 20000;
/** Where a table file's rows are saved inside an app, relative to the app. */
export const IMPORT_FOLDER = join('server', 'db', 'import');

export type ColumnType = 'text' | 'number' | 'date' | 'boolean' | 'empty';
export type Cell = string | number | boolean | null;

export type TableColumn = { name: string; type: ColumnType; blanks: number };
export type TableSummary = { name: string; rowCount: number; columns: TableColumn[]; sample: Record<string, Cell>[] };
export type ImportedTable = TableSummary & { rows: Record<string, Cell>[] };

export type ImportResult =
  | { kind: 'tables'; source: string; tables: TableSummary[]; dataFile?: string }
  | { kind: 'document'; source: string; text: string; length: number; truncated: boolean };

const TABLE_TYPES = ['.xlsx', '.csv', '.tsv'];
const DOCUMENT_TYPES = ['.docx', '.md', '.markdown', '.txt'];

function cell(value: unknown): Cell {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  const text = String(value).trim();
  return text === '' ? null : text;
}

function typeOf(values: readonly Cell[], dates: ReadonlySet<number>): ColumnType {
  const kinds = new Set<ColumnType>();
  values.forEach((value, index) => {
    if (value === null) return;
    if (dates.has(index)) kinds.add('date');
    else if (typeof value === 'number') kinds.add('number');
    else if (typeof value === 'boolean') kinds.add('boolean');
    else kinds.add('text');
  });
  if (kinds.size === 0) return 'empty';
  return kinds.size === 1 ? [...kinds][0]! : 'text';
}

/**
 * Turn a grid of cells into a table: the first row that has content names the
 * columns, the rows after it become records, and rows with no content are dropped.
 */
export function toTable(name: string, grid: readonly (readonly unknown[])[]): ImportedTable {
  const filled = grid.filter((row) => row.some((value) => cell(value) !== null));
  const [header = [], ...body] = filled;
  const width = Math.max(header.length, ...body.map((row) => row.length), 0);
  const seen = new Map<string, number>();
  const names = Array.from({ length: width }, (_, index) => {
    const base = cell(header[index]);
    const wanted = base === null ? `column_${index + 1}` : String(base);
    const count = seen.get(wanted) ?? 0;
    seen.set(wanted, count + 1);
    return count === 0 ? wanted : `${wanted}_${count + 1}`;
  });
  const dates = names.map(() => new Set<number>());
  const rows = body.map((row, rowIndex) => Object.fromEntries(names.map((column, index) => {
    if (row[index] instanceof Date) dates[index]!.add(rowIndex);
    return [column, cell(row[index])];
  })));
  const columns = names.map((column, index) => {
    const values = rows.map((row) => row[column] ?? null);
    return { name: column, type: typeOf(values, dates[index]!), blanks: values.filter((value) => value === null).length };
  });
  return { name, rowCount: rows.length, columns, sample: rows.slice(0, SAMPLE_ROWS), rows };
}

// Letters and digits of any script are kept, so a file named in Chinese keeps its name.
const slug = (text: string): string => text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || 'import';

async function readTables(file: string, type: string): Promise<ImportedTable[]> {
  if (type === '.xlsx') {
    const { default: readXlsxFile } = await import('read-excel-file/node');
    const sheets = await readXlsxFile(file);
    return sheets.map((sheet) => toTable(sheet.sheet, sheet.data as unknown[][])).filter((table) => table.columns.length > 0);
  }
  const { parse } = await import('csv-parse/sync');
  const grid = parse(await readFile(file), {
    bom: true, delimiter: type === '.tsv' ? '\t' : [',', ';', '\t'], relax_column_count: true, skip_empty_lines: true,
    cast: (value: string) => (/^-?\d+(\.\d+)?$/.test(value.trim()) && !/^-?0\d/.test(value.trim()) ? Number(value) : value),
  }) as unknown[][];
  return [toTable(basename(file, type), grid)];
}

async function readDocument(file: string, type: string): Promise<string> {
  if (type !== '.docx') return readFile(file, 'utf8');
  const mammoth = await import('mammoth');
  return (await mammoth.extractRawText({ path: file })).value;
}

/**
 * Read a file the user wants the system built from.
 *
 * A table file (Excel, CSV, TSV) is described by its columns and a few rows;
 * when `directory` names an app, every row is also saved to a JSON file inside
 * it, so the rows reach the database without passing through the model. A
 * document (Word, Markdown, text) is returned as text.
 */
export async function importFile(options: { file: string; directory?: string }): Promise<ImportResult> {
  const { file, directory } = options;
  if (!isAbsolute(file)) throw new Error('file must be an absolute path');
  if (directory !== undefined && !isAbsolute(directory)) throw new Error('directory must be an absolute path');
  const type = extname(file).toLowerCase();
  const source = basename(file);

  if (DOCUMENT_TYPES.includes(type)) {
    const text = (await readDocument(file, type)).trim();
    return { kind: 'document', source, text: text.slice(0, TEXT_LIMIT), length: text.length, truncated: text.length > TEXT_LIMIT };
  }
  if (!TABLE_TYPES.includes(type)) {
    throw new Error(`cannot read ${type || 'a file without an extension'}; supported types are ${[...TABLE_TYPES, ...DOCUMENT_TYPES].join(', ')}`);
  }

  const tables = await readTables(file, type);
  const summaries = tables.map(({ rows: _rows, ...summary }) => summary);
  if (!directory) return { kind: 'tables', source, tables: summaries };
  const folder = join(directory, IMPORT_FOLDER);
  await mkdir(folder, { recursive: true });
  const dataFile = join(folder, `${slug(basename(file, type))}.json`);
  await writeFile(dataFile, JSON.stringify({ source, tables: tables.map(({ name, rows }) => ({ name, rows })) }, null, 1));
  return { kind: 'tables', source, tables: summaries, dataFile };
}
