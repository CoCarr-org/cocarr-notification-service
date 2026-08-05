// Minimal {{var}} template interpolation. Missing vars render as empty string.
function render(template, vars = {}) {
  if (!template) return '';
  return String(template).replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
    const v = key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), vars);
    return v == null ? '' : String(v);
  });
}
module.exports = { render };
