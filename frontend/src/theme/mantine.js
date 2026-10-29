import {
  Accordion,
  Checkbox,
  Drawer,
  FileInput,
  Modal,
  NumberInput,
  Pagination,
  PasswordInput,
  Radio,
  SegmentedControl,
  Select,
  Skeleton,
  Tabs,
  Textarea,
  TextInput,
  createTheme,
} from '@mantine/core';

/**
 * Mantine is used for behaviour + accessibility (focus traps, comboboxes,
 * ARIA). ALL visual styling comes from our SCSS: each Mantine inner part is
 * given a BEM class here, and the rules live in styles/components/*.scss.
 */

// 10-step ramps so Mantine's `color="lime"` etc. never fall back to its defaults.
const lime = ['#f6ffd1', '#eeffa6', '#e2fc79', '#d7f954', '#c9f73a', '#b4e61a', '#98c400', '#76990a', '#57700d', '#3a4a0a'];
const ink = ['#f5f3ec', '#dedacc', '#b9b6ab', '#8f8f8a', '#6b6f75', '#4a5058', '#333a42', '#1b2128', '#12161b', '#0a0c0f'];

const fieldClassNames = {
  root: 'field',
  label: 'field__label',
  required: 'field__required',
  description: 'field__hint',
  error: 'field__error',
  wrapper: 'field__control',
  input: 'field__input',
  section: 'field__section',
};

const choiceClassNames = {
  root: 'choice',
  body: 'choice__body',
  inner: 'choice__box',
  input: 'choice__input',
  icon: 'choice__icon',
  label: 'choice__label',
  labelWrapper: 'choice__text',
  description: 'field__hint',
  error: 'field__error',
};

export const mantineTheme = createTheme({
  primaryColor: 'lime',
  primaryShade: 4,
  colors: { lime, ink },
  black: '#0a0c0f',
  white: '#ffffff',
  fontFamily: 'var(--ff-sans)',
  fontFamilyMonospace: 'var(--ff-mono)',
  headings: { fontFamily: 'var(--ff-display)', fontWeight: '400' },
  defaultRadius: 'md',
  focusRing: 'auto',
  cursorType: 'pointer',
  respectReducedMotion: true,
  components: {
    TextInput: TextInput.extend({ classNames: fieldClassNames }),
    PasswordInput: PasswordInput.extend({ classNames: { ...fieldClassNames, innerInput: 'field__input-inner', visibilityToggle: 'field__toggle' } }),
    NumberInput: NumberInput.extend({ classNames: fieldClassNames }),
    Textarea: Textarea.extend({ classNames: fieldClassNames }),
    FileInput: FileInput.extend({ classNames: fieldClassNames }),
    Select: Select.extend({
      classNames: { ...fieldClassNames, dropdown: 'dropdown', option: 'dropdown__option', options: 'dropdown__options' },
    }),
    Checkbox: Checkbox.extend({ classNames: choiceClassNames }),
    Radio: Radio.extend({ classNames: choiceClassNames }),
    SegmentedControl: SegmentedControl.extend({
      classNames: { root: 'segmented', control: 'segmented__control', label: 'segmented__label', indicator: 'segmented__indicator' },
    }),
    Accordion: Accordion.extend({
      classNames: {
        root: 'accordion',
        item: 'accordion__item',
        control: 'accordion__control',
        label: 'accordion__label',
        chevron: 'accordion__chevron',
        content: 'accordion__content',
        panel: 'accordion__panel',
      },
    }),
    Tabs: Tabs.extend({
      classNames: { root: 'tabs', list: 'tabs__list', tab: 'tabs__tab', tabLabel: 'tabs__label', panel: 'tabs__panel' },
    }),
    Pagination: Pagination.extend({
      classNames: { root: 'pager', control: 'pager__control', dots: 'pager__dots' },
    }),
    Drawer: Drawer.extend({
      classNames: { content: 'drawer', header: 'drawer__header', title: 'drawer__title', body: 'drawer__body', close: 'drawer__close', overlay: 'overlay' },
    }),
    Modal: Modal.extend({
      classNames: { content: 'modal', header: 'modal__header', title: 'modal__title', body: 'modal__body', close: 'modal__close', overlay: 'overlay' },
    }),
    Skeleton: Skeleton.extend({ classNames: { root: 'skeleton' } }),
  },
});
