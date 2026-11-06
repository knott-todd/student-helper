// Unit choice and syllabus order for the Track pages.

export const UNITS = [1, 2];
export const DEFAULT_UNIT = 1;

// The unit a student picked for a subject on Profile. Each user subject row
// carries `unit` (1 | 2); rows without it (older backend, new rows) are Unit 1.
export const subjectUnit = sub => {
    const unit = sub ? parseInt(sub.unit, 10) : NaN;
    return UNITS.includes(unit) ? unit : DEFAULT_UNIT;
};

// Only CAPE subjects have two units; CSEC subjects have one.
export const hasUnits = examShortName => /^CAPE$/i.test(String(examShortName || "").trim());

// The one place modules are filtered by unit. GET /familiarity/:sub/:exam
// returns each module with `module.unit_number` (unit.num), so this is
// client-side. Modules without a unit number are kept rather than hidden.
export const modulesForUnit = (modules, unit) =>
    (Array.isArray(modules) ? modules : []).filter(m => {
        const num = m && m.module ? m.module.unit_number : undefined;
        return num === undefined || num === null || parseInt(num, 10) === unit;
    });

const byNumberThenId = (a, b) =>
    (Number(a.number) || 0) - (Number(b.number) || 0) || (Number(a.id) || 0) - (Number(b.id) || 0);

// Syllabus order: modules by unit then module number.
export const sortModules = modules =>
    [...modules].sort((a, b) =>
        (Number(a.module.unit_number) || 0) - (Number(b.module.unit_number) || 0) || byNumberThenId(a.module, b.module));

// Topics and objectives have no number column; the curriculum import inserts
// them in syllabus order, so id order is syllabus order.
export const sortById = items => [...items].sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));
