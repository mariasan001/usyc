import type { PlanConfig } from './student-ledger.utils';

function keyFor(studentKey: string) {
  return `usyc_student_plan_v1:${studentKey}`;
}

export function loadStudentPlan(studentKey: string, fallback: PlanConfig): PlanConfig {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(keyFor(studentKey));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PlanConfig>;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

export function saveStudentPlan(studentKey: string, cfg: PlanConfig) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(keyFor(studentKey), JSON.stringify(cfg));
}
