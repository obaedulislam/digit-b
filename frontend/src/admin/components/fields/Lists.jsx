import { IconArrowDown, IconArrowUp, IconPlus, IconTrash } from '@tabler/icons-react';
import { Textarea, TextInput } from '@mantine/core';
import { Button } from '@/components/ui';
import { pad2 } from '@/lib/format';
import { getIn } from '../../lib/helpers';

function RowTools({ index, count, label, onMove, onRemove }) {
  return (
    <div className="admin-repeater__tools">
      <button type="button" className="admin-icon-btn" aria-label={`Move ${label} up`} disabled={index === 0} onClick={() => onMove(index, index - 1)}>
        <IconArrowUp size={16} stroke={1.75} aria-hidden="true" />
      </button>
      <button type="button" className="admin-icon-btn" aria-label={`Move ${label} down`} disabled={index === count - 1} onClick={() => onMove(index, index + 1)}>
        <IconArrowDown size={16} stroke={1.75} aria-hidden="true" />
      </button>
      <button type="button" className="admin-icon-btn admin-icon-btn--danger" aria-label={`Remove ${label}`} onClick={() => onRemove(index)}>
        <IconTrash size={16} stroke={1.75} aria-hidden="true" />
      </button>
    </div>
  );
}

/**
 * Editable list of strings with add / remove / reorder.
 * Bound to a Mantine form: `<StringListField form={form} name="requirements" label="Requirements" />`
 */
export function StringListField({ form, name, label, description, addLabel = 'Add item', placeholder, max = 30, multiline = false, itemName = 'item' }) {
  const items = getIn(form.values, name) ?? [];
  const listError = form.errors[name];
  const Input = multiline ? Textarea : TextInput;

  return (
    <fieldset className="admin-repeater">
      <legend className="field__label">{label}</legend>
      {description && <p className="field__hint admin-repeater__hint">{description}</p>}
      {items.length === 0 && <p className="admin-repeater__empty">Nothing added yet.</p>}
      <ol className="admin-repeater__list">
        {items.map((_, index) => (
          <li key={index} className="admin-repeater__row">
            <span className="admin-repeater__index" aria-hidden="true">
              {pad2(index + 1)}
            </span>
            <div className="admin-repeater__fields">
              <Input
                aria-label={`${label}: ${itemName} ${index + 1}`}
                placeholder={placeholder}
                {...(multiline ? { autosize: true, minRows: 2 } : {})}
                {...form.getInputProps(`${name}.${index}`)}
              />
            </div>
            <RowTools
              index={index}
              count={items.length}
              label={`${itemName} ${index + 1}`}
              onMove={(from, to) => form.reorderListItem(name, { from, to })}
              onRemove={(at) => form.removeListItem(name, at)}
            />
          </li>
        ))}
      </ol>
      {typeof listError === 'string' && <p className="field__error">{listError}</p>}
      <Button
        variant="secondary"
        size="sm"
        leftIcon={<IconPlus size={14} stroke={2} />}
        onClick={() => form.insertListItem(name, '')}
        disabled={items.length >= max}
      >
        {addLabel}
      </Button>
    </fieldset>
  );
}

/**
 * Editable list of objects (e.g. process steps `{ title, description }`).
 * columns: [{ name, label, placeholder, multiline }]
 */
export function ObjectListField({ form, name, label, description, columns, addLabel = 'Add row', max = 12, itemName = 'row' }) {
  const rows = getIn(form.values, name) ?? [];
  const blank = Object.fromEntries(columns.map((column) => [column.name, '']));
  const listError = form.errors[name];

  return (
    <fieldset className="admin-repeater">
      <legend className="field__label">{label}</legend>
      {description && <p className="field__hint admin-repeater__hint">{description}</p>}
      {rows.length === 0 && <p className="admin-repeater__empty">Nothing added yet.</p>}
      <ol className="admin-repeater__list">
        {rows.map((_, index) => (
          <li key={index} className="admin-repeater__row admin-repeater__row--object">
            <span className="admin-repeater__index" aria-hidden="true">
              {pad2(index + 1)}
            </span>
            <div className="admin-repeater__fields admin-repeater__fields--grid">
              {columns.map((column) => {
                const Input = column.multiline ? Textarea : TextInput;
                return (
                  <Input
                    key={column.name}
                    label={column.label}
                    placeholder={column.placeholder}
                    {...(column.multiline ? { autosize: true, minRows: 2 } : {})}
                    {...form.getInputProps(`${name}.${index}.${column.name}`)}
                  />
                );
              })}
            </div>
            <RowTools
              index={index}
              count={rows.length}
              label={`${itemName} ${index + 1}`}
              onMove={(from, to) => form.reorderListItem(name, { from, to })}
              onRemove={(at) => form.removeListItem(name, at)}
            />
          </li>
        ))}
      </ol>
      {typeof listError === 'string' && <p className="field__error">{listError}</p>}
      <Button
        variant="secondary"
        size="sm"
        leftIcon={<IconPlus size={14} stroke={2} />}
        onClick={() => form.insertListItem(name, { ...blank })}
        disabled={rows.length >= max}
      >
        {addLabel}
      </Button>
    </fieldset>
  );
}
