import test from 'node:test';
import assert from 'node:assert/strict';
import {
  colIndexToLetter,
  evaluateCell,
  expandRange,
  extractFormulaRefs,
  getRangeBounds,
  letterToColIndex,
  parseCellRef,
  SheetGrid,
} from './spreadsheetEngine';

test('coordinate conversions and multi-cell range bounds work accurately', () => {
  assert.equal(colIndexToLetter(0), 'A');
  assert.equal(colIndexToLetter(5), 'F');
  assert.equal(letterToColIndex('C'), 2);
  assert.deepEqual(parseCellRef('C3'), { col: 2, row: 2 });
  assert.deepEqual(expandRange('D2:D4'), ['D2', 'D3', 'D4']);

  const single = getRangeBounds('B2', 'B2');
  assert.equal(single.rangeLabel, 'B2');
  assert.deepEqual(single.cells, ['B2']);

  const rect = getRangeBounds('C3', 'A1');
  assert.equal(rect.rangeLabel, 'A1:C3');
  assert.equal(rect.cells.length, 9);
  assert.ok(rect.cells.includes('B2'));
});

test('French and English formulas (=SOMME, =MOYENNE, =NB.SI) compute accurately', () => {
  const grid: SheetGrid = {
    D2: { raw: '20' },
    D3: { raw: '15' },
    D4: { raw: '45' },
    D5: { raw: '25' },
    D6: { raw: '45' },
    E2: { raw: 'Fait' },
    E3: { raw: 'À faire' },
    E4: { raw: 'Fait' },
    D7: { raw: '=SOMME(D2:D6)' },
    D8: { raw: '=MOYENNE(D2:D6)' },
    E7: { raw: '=NB.SI(E2:E4; "Fait")' },
    B2: { raw: '=D2+D3' },
  };

  assert.equal(evaluateCell('D7', grid).display, '150');
  assert.equal(evaluateCell('D8', grid).display, '30');
  assert.equal(evaluateCell('E7', grid).display, '2');
  assert.equal(evaluateCell('B2', grid).display, '35');
});

test('circular references are caught safely without crashing', () => {
  const grid: SheetGrid = {
    A1: { raw: '=B1+1' },
    B1: { raw: '=A1+1' },
  };
  assert.equal(evaluateCell('A1', grid).error, '#CIRC!');
});

test('extractFormulaRefs returns highlighted cells excluding string literals', () => {
  assert.deepEqual(extractFormulaRefs('=SOMME(D2:D4)'), ['D2', 'D3', 'D4']);
  assert.deepEqual(extractFormulaRefs('=NB.SI(E2:E3; "A1")'), ['E2', 'E3']);
});
