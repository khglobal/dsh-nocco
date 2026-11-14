// Local data layer. Each collection is a list of rows kept in browser
// storage, so the app works with no backend. Rows get an `id` and a
// `createdAt` on insert.
const PREFIX = 'app:';

export function collection(name) {
  const key = PREFIX + name;
  const read = () => JSON.parse(localStorage.getItem(key) || '[]');
  const write = (rows) => localStorage.setItem(key, JSON.stringify(rows));
  return {
    list() {
      return read();
    },
    get(id) {
      return read().find((row) => row.id === id) ?? null;
    },
    insert(row) {
      const item = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...row };
      write([...read(), item]);
      return item;
    },
    update(id, patch) {
      let updated = null;
      write(read().map((row) => (row.id === id ? (updated = { ...row, ...patch }) : row)));
      return updated;
    },
    remove(id) {
      const rows = read();
      const kept = rows.filter((row) => row.id !== id);
      write(kept);
      return kept.length !== rows.length;
    },
  };
}
