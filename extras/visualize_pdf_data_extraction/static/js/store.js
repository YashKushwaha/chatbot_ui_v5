const store = {
  set(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
  },
  get(key) {
    const val = sessionStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  },
  clear(key) {
    sessionStorage.removeItem(key);
  }
};


const memoryStore = (() => {
  const store = new Map();

  return {
    set(key, value) {
      store.set(key, value);
    },
    get(key) {
      return store.get(key);
    },
    clear(key) {
      store.delete(key);
    },
    clearAll() {
      store.clear();
    }
  };
})();

export { memoryStore as store };


//export {store};