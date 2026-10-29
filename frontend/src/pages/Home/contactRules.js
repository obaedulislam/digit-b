import { compose, rules } from '@/lib/formRules';
import { INQUIRY_TYPES } from './content';

/** Validation mirrors POST /contact in docs/02-api-contract.md. */
export const contactRules = {
  name: compose(rules.required('Name'), rules.maxLength('Name', 120)),
  email: rules.email,
  inquiry_type: rules.oneOf('what you are looking for', INQUIRY_TYPES.map((t) => t.value)),
  message: rules.lengthBetween('Message', 10, 3000),
  consent: rules.consent,
};
