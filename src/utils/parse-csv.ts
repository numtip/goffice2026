/**
 * Build-time CSV parser.
 * Zero dependencies — splits on newlines and commas, trims quotes.
 * Handles header row, returns array of typed records.
 */
export type CsvRow = Record<string, string>;

export function parseCsv(raw: string): { headers: string[]; rows: CsvRow[] } {
  const lines = raw.trim().split('\n');
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = lines[0].split(',').map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const vals = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
    const row: CsvRow = {};
    headers.forEach((h, i) => {
      row[h] = vals[i] ?? '';
    });
    return row;
  });

  return { headers, rows };
}

export function getLatestValue(rows: CsvRow[], field: string): number {
  if (rows.length === 0) return 0;
  return parseFloat(rows[rows.length - 1][field]) || 0;
}

export function getFirstValue(rows: CsvRow[], field: string): number {
  if (rows.length === 0) return 0;
  return parseFloat(rows[0][field]) || 0;
}

export function computeChange(rows: CsvRow[], field: string): { absolute: number; percent: number } {
  if (rows.length < 2) return { absolute: 0, percent: 0 };
  const first = getFirstValue(rows, field);
  const last = getLatestValue(rows, field);
  const absolute = last - first;
  const percent = first !== 0 ? Math.round((absolute / first) * 100) : 0;
  return { absolute, percent };
}

export function getNumericValues(rows: CsvRow[], field: string): number[] {
  return rows.map((r) => parseFloat(r[field]) || 0);
}
