const STORAGE_KEY = "quan_ly_hang_hoa_v1";

export const storage = {
  getAll() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  saveAll(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  },

  add(item) {
    const items = this.getAll();
    items.push(item);
    this.saveAll(items);
    return items;
  },

  remove(id) {
    const items = this.getAll().filter((i) => i.id !== id);
    this.saveAll(items);
    return items;
  },

  update(updatedItem) {
    const items = this.getAll().map((i) =>
      i.id === updatedItem.id ? updatedItem : i
    );
    this.saveAll(items);
    return items;
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },
};
