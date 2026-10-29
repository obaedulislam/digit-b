/** Option lists mirroring the backend enums (docs/02-api-contract.md). */
const make = (entries) => entries.map(([value, label]) => ({ value, label }));

export const APPLICATION_STATUSES = make([
  ['new', 'New'],
  ['reviewing', 'Reviewing'],
  ['shortlisted', 'Shortlisted'],
  ['interview', 'Interview'],
  ['offered', 'Offered'],
  ['hired', 'Hired'],
  ['rejected', 'Rejected'],
]);

export const INQUIRY_STATUSES = make([
  ['new', 'New'],
  ['read', 'Read'],
  ['replied', 'Replied'],
  ['archived', 'Archived'],
]);

export const INQUIRY_TYPES = make([
  ['hiring', 'Hiring'],
  ['candidate', 'Candidate'],
  ['mentorship', 'Mentorship'],
  ['partnership', 'Partnership'],
  ['general', 'General'],
]);

export const JOB_STATUSES = make([
  ['draft', 'Draft'],
  ['published', 'Published'],
  ['closed', 'Closed'],
]);

export const CONTENT_STATUSES = make([
  ['draft', 'Draft'],
  ['published', 'Published'],
]);

export const EMPLOYMENT_TYPES = make([
  ['full_time', 'Full time'],
  ['part_time', 'Part time'],
  ['contract', 'Contract'],
  ['contract_to_hire', 'Contract to hire'],
  ['direct_hire', 'Direct hire'],
  ['temporary', 'Temporary'],
]);

export const WORK_MODES = make([
  ['remote', 'Remote'],
  ['hybrid', 'Hybrid'],
  ['onsite', 'On-site'],
]);

export const SALARY_PERIODS = make([
  ['year', 'per year'],
  ['month', 'per month'],
  ['week', 'per week'],
  ['day', 'per day'],
  ['hour', 'per hour'],
]);

export const POST_TYPES = make([
  ['article', 'Article'],
  ['blog', 'Blog post'],
]);

export const SERVICE_GROUPS = make([
  ['solution', 'Solution'],
  ['hiring_model', 'Hiring model'],
]);

export const FAQ_GROUPS = make([
  ['about', 'About'],
  ['employers', 'Employers'],
  ['candidates', 'Candidates'],
]);

export const TIERS = make([
  ['standard', 'Standard'],
  ['premium', 'Premium'],
]);

export const AUDIENCES = make([
  ['individuals', 'Individuals'],
  ['employers', 'Employers'],
]);

export const EDUCATION = {
  high_school: 'High school',
  diploma: 'Diploma',
  bachelor: "Bachelor's degree",
  master: "Master's degree",
  doctorate: 'Doctorate',
  other: 'Other',
};

export const labelOf = (options, value) => options.find((option) => option.value === value)?.label ?? value ?? '';

export const ACTIVE_FILTER = make([
  ['1', 'Published'],
  ['0', 'Hidden'],
]);
