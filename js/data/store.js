// Camada de dados. As telas falam só com `store`; o adaptador pode ser trocado
// (LocalAdapter agora, SupabaseAdapter na etapa 2) sem mexer nas telas.

const NS = 'apex:v1:';
export const SCHEMA_VERSION = 1;

class LocalAdapter {
  constructor() {
    this.mem = new Map();
    this.ok = false;
    try {
      const k = NS + '__probe';
      localStorage.setItem(k, '1');
      localStorage.removeItem(k);
      this.ok = true;
    } catch (e) {
      this.ok = false; // navegador sem armazenamento: usa memória
    }
  }
  async get(key) {
    if (!this.ok) return this.mem.has(key) ? structuredClone(this.mem.get(key)) : null;
    try {
      const raw = localStorage.getItem(NS + key);
      return raw == null ? null : JSON.parse(raw);
    } catch (e) { return null; }
  }
  async set(key, value) {
    if (!this.ok) { this.mem.set(key, structuredClone(value)); return; }
    try { localStorage.setItem(NS + key, JSON.stringify(value)); }
    catch (e) { this.mem.set(key, structuredClone(value)); }
  }
  async remove(key) {
    this.mem.delete(key);
    if (this.ok) { try { localStorage.removeItem(NS + key); } catch (e) {} }
  }
  async keys() {
    const out = new Set(this.mem.keys());
    if (this.ok) {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(NS) && !k.endsWith('__probe')) out.add(k.slice(NS.length));
        }
      } catch (e) {}
    }
    return [...out];
  }
  get persistent() { return this.ok; }
}

const listeners = new Map();

export const store = {
  adapter: new LocalAdapter(),

  get(key) { return this.adapter.get(key); },

  async set(key, value) {
    await this.adapter.set(key, value);
    (listeners.get(key) || []).forEach((fn) => fn(value));
  },

  remove(key) { return this.adapter.remove(key); },

  on(key, fn) {
    if (!listeners.has(key)) listeners.set(key, []);
    listeners.get(key).push(fn);
    return () => listeners.set(key, listeners.get(key).filter((f) => f !== fn));
  },

  async exportAll() {
    const data = {};
    for (const k of await this.adapter.keys()) data[k] = await this.adapter.get(k);
    return { app: 'apex', schema: SCHEMA_VERSION, exportedAt: new Date().toISOString(), data };
  },

  async importAll(payload) {
    if (!payload || payload.app !== 'apex' || typeof payload.data !== 'object') {
      throw new Error('invalid');
    }
    for (const [k, v] of Object.entries(payload.data)) await this.adapter.set(k, v);
  },

  async clearAll() {
    for (const k of await this.adapter.keys()) await this.adapter.remove(k);
  },

  get persistent() { return this.adapter.persistent; }
};
