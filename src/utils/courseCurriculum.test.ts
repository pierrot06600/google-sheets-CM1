import test from 'node:test';
import assert from 'node:assert/strict';
import { COURSE_STEPS, evaluateStepProgress } from './courseCurriculum';

test('CM1 curriculum includes all 5 sequential steps', () => {
  assert.equal(COURSE_STEPS.length, 5);
  assert.deepEqual(
    COURSE_STEPS.map((s) => s.number),
    [1, 2, 3, 4, 5]
  );
});

test('Step 1 and Step 4 task evaluation reacts deterministically to grid edits', () => {
  const step1 = COURSE_STEPS[0];
  let grid = structuredClone(step1.initialGrid);
  assert.equal(evaluateStepProgress(step1, grid, 'A1').completedCount, 0);

  // Task 1: click C3, then move to D4 with sticky tracking
  const afterC3 = evaluateStepProgress(step1, grid, 'C3');
  assert.equal(afterC3.taskResults['s1-t1'], true);
  const completedSticky = new Set(['s1-t1']);
  // Task 3: type Trésor in B3
  grid = { ...grid, B3: { raw: 'Trésor' } };
  assert.equal(evaluateStepProgress(step1, grid, 'D4', completedSticky).allCompleted, true);

  const step4 = COURSE_STEPS[3];
  let grid4 = structuredClone(step4.initialGrid);
  assert.equal(evaluateStepProgress(step4, grid4, 'D7').allCompleted, false);

  grid4['D7'] = { raw: '=SOMME(D2:D6)' };
  grid4['D8'] = { raw: '=MOYENNE(D2:D6)' };
  grid4['D2'] = { raw: '30' };
  assert.equal(evaluateStepProgress(step4, grid4, 'D2').allCompleted, true);
});
