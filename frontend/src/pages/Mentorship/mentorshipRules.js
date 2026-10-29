import { compose, rules } from '@/lib/formRules';

/** Validation mirrors POST /mentorship/requests in docs/02-api-contract.md. */
export const mentorshipRules = {
  program: rules.required('Programme'),
  name: compose(rules.required('Name'), rules.maxLength('Name', 120)),
  email: rules.email,
  phone: rules.optionalPhone,
  current_role: rules.maxLength('Current role', 120),
  goal: rules.lengthBetween('Your goal', 10, 2000),
  consent: rules.consent,
};

export const mentorshipInitialValues = (program = '') => ({
  program,
  name: '',
  email: '',
  phone: '',
  current_role: '',
  goal: '',
  consent: false,
  website: '',
});
