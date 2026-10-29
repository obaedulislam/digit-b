/**
 * Splits a price display such as "$9.82 per person / month" into the figure and
 * its unit. Prices are ADMIN-EDITABLE DATA (never hardcode amounts in the UI);
 * this only handles presentation and degrades to showing the whole string.
 */
export function splitPrice(price) {
  if (!price?.display) return null;
  const unit = (price.unit_label || '').trim();
  const display = price.display.trim();
  if (unit && display.endsWith(unit) && display.length > unit.length) {
    return { figure: display.slice(0, display.length - unit.length).trim(), unit };
  }
  return { figure: display, unit: '' };
}
