import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlignCenter,
  AlignLeft,
  Check,
  RotateCcw,
  Undo2,
} from 'lucide-react';
import {
  CellColorKey,
  colIndexToLetter,
  DEFAULT_COLS,
  DEFAULT_ROWS,
  evaluateCell,
  extractFormulaRefs,
  formatCellRef,
  getRangeBounds,
  parseCellRef,
  SheetGrid,
} from '../utils/spreadsheetEngine';

interface SpreadsheetSimulatorProps {
  grid: SheetGrid;
  selectedCell: string;
  onSelectCell: (ref: string) => void;
  onUpdateGrid: (nextGrid: SheetGrid) => void;
  onUndo?: () => void;
  canUndo?: boolean;
  onResetSheet?: () => void;
  titleLabel?: string;
}

const COLOR_OPTIONS: Array<{ key: CellColorKey; label: string; bgClass: string; swatchClass: string }> = [
  { key: 'none', label: 'Couleur Neutre (Blanc)', bgClass: 'bg-white', swatchClass: 'bg-white border-slate-300' },
  { key: 'sky', label: 'Couleur Bleu Ciel', bgClass: 'bg-sky-100', swatchClass: 'bg-sky-200 border-sky-400' },
  { key: 'emerald', label: 'Couleur Vert Menthe', bgClass: 'bg-emerald-100', swatchClass: 'bg-emerald-200 border-emerald-400' },
  { key: 'amber', label: 'Couleur Jaune Soleil', bgClass: 'bg-amber-100', swatchClass: 'bg-amber-200 border-amber-400' },
  { key: 'peach', label: 'Couleur Orange Pêche', bgClass: 'bg-orange-100', swatchClass: 'bg-orange-200 border-orange-400' },
  { key: 'lavender', label: 'Couleur Violet Lavande', bgClass: 'bg-purple-100', swatchClass: 'bg-purple-200 border-purple-400' },
];

function getCellBgClass(color?: CellColorKey): string {
  return COLOR_OPTIONS.find((c) => c.key === color)?.bgClass ?? 'bg-white';
}

export function SpreadsheetSimulator({
  grid,
  selectedCell,
  onSelectCell,
  onUpdateGrid,
  onUndo,
  canUndo = false,
  onResetSheet,
  titleLabel = 'Feuille Google Sheets interactive',
}: SpreadsheetSimulatorProps) {
  const [selectionEnd, setSelectionEnd] = useState<string>(selectedCell);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState<string>(grid[selectedCell]?.raw ?? '');
  const inlineInputRef = useRef<HTMLInputElement>(null);
  const isDraggingRef = useRef(false);
  const anchorRef = useRef(selectedCell);

  const selectedCellData = grid[selectedCell];
  const selectedEval = useMemo(() => evaluateCell(selectedCell, grid), [selectedCell, grid]);

  const rangeBounds = useMemo(
    () => getRangeBounds(selectedCell, selectionEnd),
    [selectedCell, selectionEnd]
  );

  const selectedCellSet = useMemo(() => new Set(rangeBounds.cells), [rangeBounds]);
  const isMultiSelected = rangeBounds.cells.length > 1;

  // Reset range end when selectedCell changes outside of active drag
  useEffect(() => {
    if (!isDraggingRef.current && anchorRef.current !== selectedCell) {
      anchorRef.current = selectedCell;
      setSelectionEnd(selectedCell);
    }
  }, [selectedCell]);

  // Sync draft when switching selected cell
  useEffect(() => {
    setDraftValue(grid[selectedCell]?.raw ?? '');
    setEditingCell(null);
  }, [selectedCell, grid]);

  useEffect(() => {
    if (editingCell && inlineInputRef.current) {
      inlineInputRef.current.focus();
    }
  }, [editingCell]);

  // Global pointer listeners to support smooth mouse + touch drag across cells
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const cellEl = el?.closest('[data-cell-ref]');
      const hoveredRef = cellEl?.getAttribute('data-cell-ref');
      if (hoveredRef) {
        setSelectionEnd(hoveredRef);
      }
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, []);

  // Highlight cells referenced by active formula (either while editing or inspecting)
  const highlightedRefs = useMemo(() => {
    const source = draftValue.trim().startsWith('=') ? draftValue : selectedCellData?.raw ?? '';
    return new Set(extractFormulaRefs(source));
  }, [draftValue, selectedCellData]);

  const parsedAnchor = useMemo(() => parseCellRef(selectedCell) ?? { col: 0, row: 0 }, [selectedCell]);
  const parsedEnd = useMemo(() => parseCellRef(selectionEnd) ?? parsedAnchor, [selectionEnd, parsedAnchor]);

  const commitValue = (targetRef: string, newRaw: string) => {
    const prev = grid[targetRef] ?? { raw: '' };
    if (prev.raw === newRaw) {
      setEditingCell(null);
      return;
    }
    const nextGrid: SheetGrid = {
      ...grid,
      [targetRef]: {
        ...prev,
        raw: newRaw,
      },
    };
    onUpdateGrid(nextGrid);
    setEditingCell(null);
  };

  const clearSelectedCells = () => {
    const nextGrid: SheetGrid = { ...grid };
    let changed = false;
    for (const ref of rangeBounds.cells) {
      const prev = nextGrid[ref];
      if (prev && prev.raw !== '') {
        nextGrid[ref] = { ...prev, raw: '' };
        changed = true;
      }
    }
    if (changed) {
      onUpdateGrid(nextGrid);
      setDraftValue('');
    }
  };

  const allSelectedBold = useMemo(
    () => rangeBounds.cells.every((ref) => Boolean(grid[ref]?.bold)),
    [grid, rangeBounds.cells]
  );

  const toggleBold = () => {
    const targetBold = !allSelectedBold;
    const nextGrid: SheetGrid = { ...grid };
    for (const ref of rangeBounds.cells) {
      const prev = nextGrid[ref] ?? { raw: '' };
      nextGrid[ref] = { ...prev, bold: targetBold };
    }
    onUpdateGrid(nextGrid);
  };

  const setColor = (color: CellColorKey) => {
    const nextGrid: SheetGrid = { ...grid };
    for (const ref of rangeBounds.cells) {
      const prev = nextGrid[ref] ?? { raw: '' };
      nextGrid[ref] = { ...prev, color };
    }
    onUpdateGrid(nextGrid);
  };

  const setAlign = (align: 'left' | 'center') => {
    const nextGrid: SheetGrid = { ...grid };
    for (const ref of rangeBounds.cells) {
      const prev = nextGrid[ref] ?? { raw: '' };
      nextGrid[ref] = { ...prev, align };
    }
    onUpdateGrid(nextGrid);
  };

  const moveSelection = (dCol: number, dRow: number, extendRange: boolean = false) => {
    const base = extendRange ? parsedEnd : parsedAnchor;
    const nextCol = Math.max(0, Math.min(DEFAULT_COLS - 1, base.col + dCol));
    const nextRow = Math.max(0, Math.min(DEFAULT_ROWS - 1, base.row + dRow));
    const nextRef = formatCellRef(nextCol, nextRow);
    if (extendRange) {
      setSelectionEnd(nextRef);
    } else {
      anchorRef.current = nextRef;
      setSelectionEnd(nextRef);
      onSelectCell(nextRef);
    }
  };

  const handleCellKeyDown = (e: React.KeyboardEvent, ref: string) => {
    if (editingCell === ref) {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitValue(ref, draftValue);
        moveSelection(0, 1);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        commitValue(ref, draftValue);
        moveSelection(1, 0);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setDraftValue(grid[ref]?.raw ?? '');
        setEditingCell(null);
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveSelection(0, -1, e.shiftKey);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveSelection(0, 1, e.shiftKey);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      moveSelection(-1, 0, e.shiftKey);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      moveSelection(1, 0, e.shiftKey);
    } else if (e.key === 'Enter' || e.key === 'F2') {
      e.preventDefault();
      setEditingCell(ref);
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      clearSelectedCells();
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      anchorRef.current = ref;
      setSelectionEnd(ref);
      setDraftValue(e.key);
      setEditingCell(ref);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col hc-surface">
      {/* Top Sheet Header Bar */}
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 hc-surface">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
            GS
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-sm sm:text-base font-bold text-slate-900 truncate">
              {titleLabel}
            </h3>
            <p className="text-xs text-slate-500 hc-muted truncate">
              Clique et glisse pour sélectionner plusieurs cases · Tape au clavier ou double-clique pour écrire
            </p>
          </div>
        </div>

        {onResetSheet && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onResetSheet}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-100 whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser</span>
            </button>
          </div>
        )}
      </div>

      {/* Formatting Toolbar */}
      <div className="px-3 sm:px-4 py-2.5 border-b border-slate-200 bg-white flex flex-wrap items-center gap-2 hc-surface">
        {onUndo && (
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            aria-label="Annuler la dernière modification"
            className={`inline-flex items-center gap-1 min-h-[40px] px-2.5 rounded-lg border text-xs font-semibold transition-colors ${
              canUndo
                ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                : 'border-slate-200 text-slate-300 cursor-not-allowed'
            }`}
          >
            <Undo2 className="w-4 h-4" />
            <span className="hidden sm:inline">Annuler</span>
          </button>
        )}

        <button
          type="button"
          onClick={toggleBold}
          aria-pressed={allSelectedBold}
          aria-label="Mettre en gras (G)"
          className={`inline-flex items-center justify-center min-h-[40px] min-w-[40px] px-3 rounded-lg border text-sm font-bold transition-colors ${
            allSelectedBold
              ? 'bg-slate-900 border-slate-900 text-white'
              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <span>G</span>
        </button>

        <div className="flex items-center gap-1 border-l border-r border-slate-200 px-2">
          <button
            type="button"
            onClick={() => setAlign('left')}
            aria-label="Aligner à gauche"
            aria-pressed={(selectedCellData?.align ?? 'left') === 'left'}
            className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border transition-colors ${
              (selectedCellData?.align ?? 'left') === 'left'
                ? 'bg-sky-50 border-sky-500 text-sky-800'
                : 'border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setAlign('center')}
            aria-label="Centrer le texte"
            aria-pressed={selectedCellData?.align === 'center'}
            className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border transition-colors ${
              selectedCellData?.align === 'center'
                ? 'bg-sky-50 border-sky-500 text-sky-800'
                : 'border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <AlignCenter className="w-4 h-4" />
          </button>
        </div>

        {/* Color Swatches */}
        <div className="flex items-center gap-1.5" role="group" aria-label="Couleur de la sélection">
          {COLOR_OPTIONS.map((c) => {
            const active = (selectedCellData?.color ?? 'none') === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setColor(c.key)}
                aria-label={c.label}
                aria-pressed={active}
                title={c.label}
                className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center transition-transform ${c.swatchClass} ${
                  active ? 'ring-2 ring-sky-600 ring-offset-1 scale-105' : 'hover:scale-105'
                }`}
              >
                {active && <Check className="w-4 h-4 text-slate-800" />}
              </button>
            );
          })}
        </div>

        {isMultiSelected && (
          <span className="ml-auto text-xs font-semibold text-sky-800 font-mono-tabular">
            {rangeBounds.cells.length} cases sélectionnées ({rangeBounds.rangeLabel})
          </span>
        )}
      </div>

      {/* Formula Bar (fx) — keyboard entry */}
      <div className="px-3 sm:px-4 py-2.5 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center gap-2 hc-surface">
        <div
          className="min-w-[58px] h-10 px-2.5 rounded-lg bg-sky-600 text-white font-mono-tabular text-sm font-bold flex items-center justify-center shrink-0"
          aria-label={`Sélection active ${rangeBounds.rangeLabel}`}
        >
          {rangeBounds.rangeLabel}
        </div>

        <span className="font-mono-tabular text-sm font-bold text-purple-700 px-1 shrink-0" aria-hidden="true">
          fx
        </span>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            commitValue(selectedCell, draftValue);
          }}
          className="flex-1 min-w-[200px] flex items-center gap-2"
        >
          <input
            type="text"
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
            aria-label={`Contenu de la cellule ${selectedCell}`}
            placeholder="Tape au clavier un mot, un nombre ou =SOMME(D2:D6)..."
            className="flex-1 min-h-[42px] px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm font-mono-tabular focus:outline-none focus:ring-2 focus:ring-sky-600"
          />
          <button
            type="submit"
            className="min-h-[42px] px-4 py-1.5 rounded-lg bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 whitespace-nowrap shrink-0"
          >
            Valider
          </button>
        </form>
      </div>

      {/* Formula Live Explanation Banner (when active cell has formula or error) */}
      {(selectedEval.isFormula || selectedEval.error) && (
        <div className="px-4 py-2 border-b border-slate-200 bg-sky-50/70 text-xs flex flex-wrap items-center justify-between gap-2">
          {selectedEval.error ? (
            <span className="font-semibold text-red-700">
              Astuce formule ({selectedCell}) : vérifie les parenthèses et les deux-points (exemple : =SOMME(D2:D6)).
            </span>
          ) : (
            <span className="text-sky-950 font-medium">
              Formule active dans <strong className="font-mono-tabular">{selectedCell}</strong> :{' '}
              <span className="font-mono-tabular font-bold">{grid[selectedCell]?.raw}</span> → Résultat affiché :{' '}
              <strong className="font-mono-tabular text-emerald-700">{selectedEval.display}</strong>
              {highlightedRefs.size > 0 && ' (les cases encadrées en orange sont utilisées dans ce calcul)'}
            </span>
          )}
        </div>
      )}

      {/* Spreadsheet Grid Table */}
      <div className="overflow-x-auto bg-white select-none">
        <table
          role="grid"
          aria-label="Grille du tableur"
          className="w-full border-collapse table-fixed min-w-[720px]"
        >
          <colgroup>
            <col className="w-12" />
            <col className="w-[24%]" />
            <col className="w-[21%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
            <col className="w-[13%]" />
          </colgroup>
          <thead>
            <tr>
              <th
                scope="col"
                className="w-12 h-11 bg-slate-100 border-b border-r border-slate-300 text-xs font-mono-tabular text-slate-500"
                aria-label="Coin de grille"
              />
              {Array.from({ length: DEFAULT_COLS }).map((_, colIdx) => {
                const colLetter = colIndexToLetter(colIdx);
                const isSelectedCol = colIdx >= rangeBounds.minCol && colIdx <= rangeBounds.maxCol;
                return (
                  <th
                    key={colLetter}
                    scope="col"
                    className={`h-11 border-b border-r border-slate-300 font-mono-tabular text-sm font-bold text-center transition-colors ${
                      isSelectedCol
                        ? 'bg-sky-600 text-white'
                        : 'bg-sky-50 text-sky-900'
                    }`}
                  >
                    {colLetter}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="touch-none">
            {Array.from({ length: DEFAULT_ROWS }).map((_, rowIdx) => {
              const rowNum = rowIdx + 1;
              const isSelectedRow = rowIdx >= rangeBounds.minRow && rowIdx <= rangeBounds.maxRow;
              return (
                <tr key={rowNum}>
                  <th
                    scope="row"
                    className={`w-12 h-12 border-b border-r border-slate-300 font-mono-tabular text-sm font-bold text-center transition-colors ${
                      isSelectedRow
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 text-emerald-900'
                    }`}
                  >
                    {rowNum}
                  </th>
                  {Array.from({ length: DEFAULT_COLS }).map((__, colIdx) => {
                    const ref = formatCellRef(colIdx, rowIdx);
                    const cell = grid[ref];
                    const evaluated = evaluateCell(ref, grid);
                    const isAnchor = selectedCell === ref;
                    const inSelection = selectedCellSet.has(ref);
                    const isEditing = editingCell === ref;
                    const isReferenced = highlightedRefs.has(ref) && !inSelection;
                    const bgClass = getCellBgClass(cell?.color);
                    const alignClass =
                      cell?.align === 'center'
                        ? 'text-center justify-center'
                        : cell?.align === 'right'
                        ? 'text-right justify-end'
                        : 'text-left justify-start';

                    const numericClass = evaluated.numericValue !== null ? 'font-mono-tabular' : '';

                    // Perimeter edges for clean multi-cell selection box
                    const topEdge = inSelection && rowIdx === rangeBounds.minRow;
                    const bottomEdge = inSelection && rowIdx === rangeBounds.maxRow;
                    const leftEdge = inSelection && colIdx === rangeBounds.minCol;
                    const rightEdge = inSelection && colIdx === rangeBounds.maxCol;

                    const selectionClasses = isMultiSelected && inSelection
                      ? [
                          'ring-inset',
                          topEdge ? 'border-t-2 border-t-sky-600' : '',
                          bottomEdge ? 'border-b-2 border-b-sky-600' : '',
                          leftEdge ? 'border-l-2 border-l-sky-600' : '',
                          rightEdge ? 'border-r-2 border-r-sky-600' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')
                      : isAnchor
                      ? 'outline-2 outline-sky-600 -outline-offset-2 z-10'
                      : isReferenced
                      ? 'outline-2 outline-dashed outline-amber-500 -outline-offset-2 bg-amber-50/60'
                      : '';

                    return (
                      <td
                        key={ref}
                        data-cell-ref={ref}
                        className={`p-0 border-b border-r border-slate-200 relative h-12 align-middle transition-colors ${bgClass} ${selectionClasses}`}
                      >
                        {isMultiSelected && inSelection && (
                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 bg-sky-500/15"
                          />
                        )}
                        {isEditing ? (
                          <input
                            ref={inlineInputRef}
                            type="text"
                            value={draftValue}
                            onChange={(e) => setDraftValue(e.target.value)}
                            onBlur={() => commitValue(ref, draftValue)}
                            onKeyDown={(e) => handleCellKeyDown(e, ref)}
                            aria-label={`Modifier la cellule ${ref}`}
                            className="relative z-10 w-full h-full px-2.5 text-sm bg-white text-slate-900 font-mono-tabular focus:outline-none"
                          />
                        ) : (
                          <button
                            type="button"
                            data-cell-ref={ref}
                            onPointerDown={(e) => {
                              if (e.pointerType === 'mouse' && e.button !== 0) return;
                              if (e.shiftKey) {
                                setSelectionEnd(ref);
                                return;
                              }
                              isDraggingRef.current = true;
                              anchorRef.current = ref;
                              onSelectCell(ref);
                              setSelectionEnd(ref);
                            }}
                            onPointerEnter={() => {
                              if (isDraggingRef.current) {
                                setSelectionEnd(ref);
                              }
                            }}
                            onDoubleClick={() => {
                              isDraggingRef.current = false;
                              anchorRef.current = ref;
                              onSelectCell(ref);
                              setSelectionEnd(ref);
                              setEditingCell(ref);
                            }}
                            onKeyDown={(e) => handleCellKeyDown(e, ref)}
                            aria-label={`Cellule ${ref}${evaluated.display ? `, valeur ${evaluated.display}` : ', vide'}`}
                            aria-selected={inSelection}
                            className={`relative z-10 w-full h-full min-h-[46px] px-2.5 flex items-center text-sm truncate focus:outline-none ${alignClass} ${numericClass} ${
                              cell?.bold ? 'font-bold text-slate-950' : 'font-normal text-slate-800'
                            } ${evaluated.error ? 'text-red-700 font-semibold' : ''}`}
                          >
                            <span className="truncate">
                              {evaluated.display}
                            </span>
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
