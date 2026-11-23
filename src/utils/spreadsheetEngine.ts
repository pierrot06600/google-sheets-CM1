export type CellColorKey = 'none' | 'sky' | 'emerald' | 'amber' | 'peach' | 'lavender';

export interface CellData {
  raw: string;
  bold?: boolean;
  color?: CellColorKey;
  align?: 'left' | 'center' | 'right';
}

export type SheetGrid = Record<string, CellData>;

export interface CellEvalResult {
  display: string;
  numericValue: number | null;
  isFormula: boolean;
  error: string | null;
  refs: string[];
}

export const DEFAULT_COLS = 6; // A..F
export const DEFAULT_ROWS = 10; // 1..10

export function colIndexToLetter(index: number): string {
  if (index < 0) return '';
  let n = index;
  let result = '';
  while (n >= 0) {
    result = String.fromCharCode((n % 26) + 65) + result;
    n = Math.floor(n / 26) - 1;
  }
  return result;
}

export function letterToColIndex(letters: string): number {
  const clean = letters.trim().toUpperCase();
  if (!/^[A-Z]+$/.test(clean)) return -1;
  let col = 0;
  for (let i = 0; i < clean.length; i++) {
    col = col * 26 + (clean.charCodeAt(i) - 64);
  }
  return col - 1;
}

export function parseCellRef(ref: string): { col: number; row: number } | null {
  const match = /^([A-Za-z]+)([1-9][0-9]*)$/.exec(ref.trim());
  if (!match) return null;
  const col = letterToColIndex(match[1]);
  const row = parseInt(match[2], 10) - 1;
  if (col < 0 || row < 0) return null;
  return { col, row };
}

export function formatCellRef(col: number, row: number): string {
  return `${colIndexToLetter(col)}${row + 1}`;
}

export function expandRange(rangeStr: string): string[] {
  const parts = rangeStr.split(':');
  if (parts.length !== 2) return [];
  const start = parseCellRef(parts[0]);
  const end = parseCellRef(parts[1]);
  if (!start || !end) return [];

  const minCol = Math.min(start.col, end.col);
  const maxCol = Math.max(start.col, end.col);
  const minRow = Math.min(start.row, end.row);
  const maxRow = Math.max(start.row, end.row);

  // Guard against accidental huge ranges
  if ((maxCol - minCol + 1) * (maxRow - minRow + 1) > 500) {
    return [];
  }

  const refs: string[] = [];
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      refs.push(formatCellRef(c, r));
    }
  }
  return refs;
}

export interface RangeBounds {
  minCol: number;
  maxCol: number;
  minRow: number;
  maxRow: number;
  rangeLabel: string;
  cells: string[];
}

export function getRangeBounds(startRef: string, endRef: string): RangeBounds {
  const start = parseCellRef(startRef) ?? { col: 0, row: 0 };
  const end = parseCellRef(endRef) ?? start;
  const minCol = Math.min(start.col, end.col);
  const maxCol = Math.max(start.col, end.col);
  const minRow = Math.min(start.row, end.row);
  const maxRow = Math.max(start.row, end.row);

  const topLeft = formatCellRef(minCol, minRow);
  const bottomRight = formatCellRef(maxCol, maxRow);
  const rangeLabel = topLeft === bottomRight ? topLeft : `${topLeft}:${bottomRight}`;

  const cells: string[] = [];
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      cells.push(formatCellRef(c, r));
    }
  }
  return { minCol, maxCol, minRow, maxRow, rangeLabel, cells };
}

export function extractFormulaRefs(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed.startsWith('=')) return [];

  const refs: string[] = [];
  const seen = new Set<string>();
  const body = trimmed.slice(1);

  // Strip quoted strings first so text criteria like "A1" aren't treated as cell refs
  const withoutStrings = body.replace(/"[^"]*"/g, ' ');

  // Match ranges like C2:C6 first
  const rangeRegex = /\b([A-Za-z]+[1-9][0-9]*:[A-Za-z]+[1-9][0-9]*)\b/g;
  let match: RegExpExecArray | null;
  let remaining = withoutStrings;

  while ((match = rangeRegex.exec(withoutStrings)) !== null) {
    const expanded = expandRange(match[1]);
    for (const ref of expanded) {
      if (!seen.has(ref)) {
        seen.add(ref);
        refs.push(ref);
      }
    }
    remaining = remaining.replace(match[1], ' ');
  }

  // Match single cell references like B2
  const cellRegex = /\b([A-Za-z]+[1-9][0-9]*)\b/g;
  while ((match = cellRegex.exec(remaining)) !== null) {
    const upper = match[1].toUpperCase();
    if (parseCellRef(upper) && !seen.has(upper)) {
      seen.add(upper);
      refs.push(upper);
    }
  }

  return refs;
}

export function parseLocaleNumber(val: string): number | null {
  const clean = val.trim().replace(/\s+/g, '').replace(',', '.');
  if (clean === '' || !/^-?\d+(\.\d+)?$/.test(clean)) return null;
  const num = Number(clean);
  return Number.isFinite(num) ? num : null;
}

export function formatFrenchNumber(num: number): string {
  const rounded = Math.round(num * 100) / 100;
  if (Number.isInteger(rounded)) {
    return String(rounded);
  }
  return String(rounded).replace('.', ',');
}

function splitFormulaArgs(argsStr: string): string[] {
  const args: string[] = [];
  let current = '';
  let depth = 0;
  let inQuotes = false;

  for (let i = 0; i < argsStr.length; i++) {
    const ch = argsStr[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch;
    } else if (!inQuotes) {
      if (ch === '(') depth++;
      else if (ch === ')') depth = Math.max(0, depth - 1);

      if ((ch === ';' || ch === ',') && depth === 0) {
        args.push(current.trim());
        current = '';
        continue;
      }
      current += ch;
    } else {
      current += ch;
    }
  }
  if (current.trim() !== '') {
    args.push(current.trim());
  }
  return args;
}

// Safe recursive-descent arithmetic evaluator (numbers, +, -, *, /, parentheses, cell refs)
function evaluateArithmetic(
  expr: string,
  grid: SheetGrid,
  visited: Set<string>
): { value: number | null; error: string | null } {
  const tokens: Array<{ type: 'num'; val: number } | { type: 'op'; val: string } | { type: 'paren'; val: string }> = [];
  let i = 0;

  while (i < expr.length) {
    const ch = expr[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if ('+-*/'.includes(ch)) {
      tokens.push({ type: 'op', val: ch });
      i++;
      continue;
    }
    if (ch === '(' || ch === ')') {
      tokens.push({ type: 'paren', val: ch });
      i++;
      continue;
    }
    if (/[0-9]/.test(ch) || ch === ',' || ch === '.') {
      let numStr = '';
      while (i < expr.length && (/[0-9]/.test(expr[i]) || expr[i] === ',' || expr[i] === '.')) {
        numStr += expr[i] === ',' ? '.' : expr[i];
        i++;
      }
      const num = Number(numStr);
      if (!Number.isFinite(num)) {
        return { value: null, error: '#ERREUR!' };
      }
      tokens.push({ type: 'num', val: num });
      continue;
    }
    if (/[A-Za-z]/.test(ch)) {
      let ident = '';
      while (i < expr.length && /[A-Za-z0-9]/.test(expr[i])) {
        ident += expr[i];
        i++;
      }
      const upper = ident.toUpperCase();
      if (!parseCellRef(upper)) {
        return { value: null, error: '#NOM?' };
      }
      const cellRes = evaluateCell(upper, grid, visited);
      if (cellRes.error) {
        return { value: null, error: cellRes.error };
      }
      const rawCell = grid[upper]?.raw?.trim() ?? '';
      if (rawCell === '') {
        tokens.push({ type: 'num', val: 0 });
      } else if (cellRes.numericValue !== null) {
        tokens.push({ type: 'num', val: cellRes.numericValue });
      } else {
        return { value: null, error: '#VALEUR!' };
      }
      continue;
    }
    return { value: null, error: '#ERREUR!' };
  }

  let pos = 0;

  function parseExpression(): number | null {
    let left = parseTerm();
    if (left === null) return null;
    while (pos < tokens.length && tokens[pos].type === 'op' && (tokens[pos].val === '+' || tokens[pos].val === '-')) {
      const op = tokens[pos].val;
      pos++;
      const right = parseTerm();
      if (right === null) return null;
      left = op === '+' ? left + right : left - right;
    }
    return left;
  }

  function parseTerm(): number | null {
    let left = parseFactor();
    if (left === null) return null;
    while (pos < tokens.length && tokens[pos].type === 'op' && (tokens[pos].val === '*' || tokens[pos].val === '/')) {
      const op = tokens[pos].val;
      pos++;
      const right = parseFactor();
      if (right === null) return null;
      if (op === '/') {
        if (right === 0) throw new Error('#DIV/0!');
        left = left / right;
      } else {
        left = left * right;
      }
    }
    return left;
  }

  function parseFactor(): number | null {
    if (pos >= tokens.length) return null;
    const tok = tokens[pos];
    if (tok.type === 'op' && (tok.val === '+' || tok.val === '-')) {
      pos++;
      const inner = parseFactor();
      if (inner === null) return null;
      return tok.val === '-' ? -inner : inner;
    }
    if (tok.type === 'num') {
      pos++;
      return tok.val;
    }
    if (tok.type === 'paren' && tok.val === '(') {
      pos++;
      const val = parseExpression();
      if (val === null || pos >= tokens.length || tokens[pos].type !== 'paren' || tokens[pos].val !== ')') {
        return null;
      }
      pos++;
      return val;
    }
    return null;
  }

  try {
    const result = parseExpression();
    if (result === null || pos !== tokens.length) {
      return { value: null, error: '#ERREUR!' };
    }
    return { value: result, error: null };
  } catch (err) {
    if (err instanceof Error && err.message === '#DIV/0!') {
      return { value: null, error: '#DIV/0!' };
    }
    return { value: null, error: '#ERREUR!' };
  }
}

function collectNumericValues(args: string[], grid: SheetGrid, visited: Set<string>): { values: number[]; error: string | null } {
  const values: number[] = [];
  for (const arg of args) {
    if (!arg) continue;
    if (arg.includes(':')) {
      const expanded = expandRange(arg);
      if (expanded.length === 0) {
        return { values: [], error: '#PLAGE?' };
      }
      for (const ref of expanded) {
        const res = evaluateCell(ref, grid, visited);
        if (res.error) return { values: [], error: res.error };
        if (res.numericValue !== null) {
          values.push(res.numericValue);
        }
      }
    } else if (parseCellRef(arg)) {
      const res = evaluateCell(arg.toUpperCase(), grid, visited);
      if (res.error) return { values: [], error: res.error };
      if (res.numericValue !== null) {
        values.push(res.numericValue);
      }
    } else {
      const literal = parseLocaleNumber(arg);
      if (literal !== null) {
        values.push(literal);
      } else {
        const arith = evaluateArithmetic(arg, grid, visited);
        if (arith.error || arith.value === null) {
          return { values: [], error: arith.error ?? '#ERREUR!' };
        }
        values.push(arith.value);
      }
    }
  }
  return { values, error: null };
}

export function evaluateCell(
  cellRef: string,
  grid: SheetGrid,
  visited: Set<string> = new Set()
): CellEvalResult {
  const normalizedRef = cellRef.toUpperCase();
  const cell = grid[normalizedRef];
  const raw = cell?.raw ?? '';
  const trimmed = raw.trim();

  if (trimmed === '') {
    return { display: '', numericValue: null, isFormula: false, error: null, refs: [] };
  }

  if (!trimmed.startsWith('=')) {
    const num = parseLocaleNumber(trimmed);
    return {
      display: raw,
      numericValue: num,
      isFormula: false,
      error: null,
      refs: [],
    };
  }

  if (visited.has(normalizedRef)) {
    return {
      display: '#CIRC!',
      numericValue: null,
      isFormula: true,
      error: '#CIRC!',
      refs: extractFormulaRefs(raw),
    };
  }

  const nextVisited = new Set(visited);
  nextVisited.add(normalizedRef);

  const refs = extractFormulaRefs(raw);
  const formulaBody = trimmed.slice(1).trim();

  // Function call pattern: NAME(args)
  const fnMatch = /^([A-Za-zÀ-ÿ.]+)\((.*)\)$/.exec(formulaBody);
  if (fnMatch) {
    const fnName = fnMatch[1].toUpperCase();
    const args = splitFormulaArgs(fnMatch[2]);

    if (fnName === 'SOMME' || fnName === 'SUM') {
      const { values, error } = collectNumericValues(args, grid, nextVisited);
      if (error) return { display: error, numericValue: null, isFormula: true, error, refs };
      const sum = values.reduce((acc, v) => acc + v, 0);
      return { display: formatFrenchNumber(sum), numericValue: sum, isFormula: true, error: null, refs };
    }

    if (fnName === 'MOYENNE' || fnName === 'AVERAGE') {
      const { values, error } = collectNumericValues(args, grid, nextVisited);
      if (error) return { display: error, numericValue: null, isFormula: true, error, refs };
      if (values.length === 0) return { display: '#DIV/0!', numericValue: null, isFormula: true, error: '#DIV/0!', refs };
      const avg = values.reduce((acc, v) => acc + v, 0) / values.length;
      return { display: formatFrenchNumber(avg), numericValue: avg, isFormula: true, error: null, refs };
    }

    if (fnName === 'MIN') {
      const { values, error } = collectNumericValues(args, grid, nextVisited);
      if (error) return { display: error, numericValue: null, isFormula: true, error, refs };
      if (values.length === 0) return { display: '0', numericValue: 0, isFormula: true, error: null, refs };
      const m = Math.min(...values);
      return { display: formatFrenchNumber(m), numericValue: m, isFormula: true, error: null, refs };
    }

    if (fnName === 'MAX') {
      const { values, error } = collectNumericValues(args, grid, nextVisited);
      if (error) return { display: error, numericValue: null, isFormula: true, error, refs };
      if (values.length === 0) return { display: '0', numericValue: 0, isFormula: true, error: null, refs };
      const m = Math.max(...values);
      return { display: formatFrenchNumber(m), numericValue: m, isFormula: true, error: null, refs };
    }

    if (fnName === 'NB' || fnName === 'COUNT') {
      const { values, error } = collectNumericValues(args, grid, nextVisited);
      if (error) return { display: error, numericValue: null, isFormula: true, error, refs };
      return { display: String(values.length), numericValue: values.length, isFormula: true, error: null, refs };
    }

    if (fnName === 'NB.SI' || fnName === 'COUNTIF') {
      if (args.length < 2) {
        return { display: '#ERREUR!', numericValue: null, isFormula: true, error: '#ERREUR!', refs };
      }
      const targetRange = args[0];
      const expanded = targetRange.includes(':') ? expandRange(targetRange) : parseCellRef(targetRange) ? [targetRange.toUpperCase()] : [];
      if (expanded.length === 0) {
        return { display: '#PLAGE?', numericValue: null, isFormula: true, error: '#PLAGE?', refs };
      }
      let criteria = args[1].trim();
      if ((criteria.startsWith('"') && criteria.endsWith('"')) || (criteria.startsWith("'") && criteria.endsWith("'"))) {
        criteria = criteria.slice(1, -1);
      }
      const criteriaLower = criteria.toLowerCase();
      let count = 0;

      for (const ref of expanded) {
        const res = evaluateCell(ref, grid, nextVisited);
        if (res.error) return { display: res.error, numericValue: null, isFormula: true, error: res.error, refs };

        if (criteria.startsWith('>') || criteria.startsWith('<') || criteria.startsWith('=')) {
          const op = criteria.startsWith('>=') || criteria.startsWith('<=') ? criteria.slice(0, 2) : criteria[0];
          const numTarget = parseLocaleNumber(criteria.slice(op.length));
          if (numTarget !== null && res.numericValue !== null) {
            if (op === '>' && res.numericValue > numTarget) count++;
            else if (op === '<' && res.numericValue < numTarget) count++;
            else if (op === '>=' && res.numericValue >= numTarget) count++;
            else if (op === '<=' && res.numericValue <= numTarget) count++;
            else if (op === '=' && res.numericValue === numTarget) count++;
          }
        } else if (res.display.trim().toLowerCase() === criteriaLower) {
          count++;
        }
      }
      return { display: String(count), numericValue: count, isFormula: true, error: null, refs };
    }

    return { display: '#NOM?', numericValue: null, isFormula: true, error: '#NOM?', refs };
  }

  // Fallback: direct arithmetic expression with cell refs
  const arith = evaluateArithmetic(formulaBody, grid, nextVisited);
  if (arith.error || arith.value === null) {
    return {
      display: arith.error ?? '#ERREUR!',
      numericValue: null,
      isFormula: true,
      error: arith.error ?? '#ERREUR!',
      refs,
    };
  }

  return {
    display: formatFrenchNumber(arith.value),
    numericValue: arith.value,
    isFormula: true,
    error: null,
    refs,
  };
}
