/**
 * RAKAN Prompt - High-Performance IndexedDB Storage Engine
 * Handles 50,000+ prompt items and base64 images seamlessly with local indexing.
 */

import { Section, Category, PromptItem, Tag, ActivityLog, AppSettings } from '../types';

const DB_NAME = 'RakanPromptDB';
const DB_VERSION = 1;

class IndexedDBEngine {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  public async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Sections Store
        if (!db.objectStoreNames.contains('sections')) {
          const sectionStore = db.createObjectStore('sections', { keyPath: 'id' });
          sectionStore.createIndex('order', 'order', { unique: false });
          sectionStore.createIndex('isPinned', 'isPinned', { unique: false });
          sectionStore.createIndex('isFavorite', 'isFavorite', { unique: false });
        }

        // Categories Store
        if (!db.objectStoreNames.contains('categories')) {
          const catStore = db.createObjectStore('categories', { keyPath: 'id' });
          catStore.createIndex('sectionId', 'sectionId', { unique: false });
          catStore.createIndex('order', 'order', { unique: false });
        }

        // Prompts Store
        if (!db.objectStoreNames.contains('prompts')) {
          const promptStore = db.createObjectStore('prompts', { keyPath: 'id' });
          promptStore.createIndex('categoryId', 'categoryId', { unique: false });
          promptStore.createIndex('sectionId', 'sectionId', { unique: false });
          promptStore.createIndex('isFavorite', 'isFavorite', { unique: false });
          promptStore.createIndex('isPinned', 'isPinned', { unique: false });
          promptStore.createIndex('isDeleted', 'isDeleted', { unique: false });
          promptStore.createIndex('createdAt', 'createdAt', { unique: false });
          promptStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // Tags Store
        if (!db.objectStoreNames.contains('tags')) {
          db.createObjectStore('tags', { keyPath: 'id' });
        }

        // Activity Logs Store
        if (!db.objectStoreNames.contains('activityLogs')) {
          db.createObjectStore('activityLogs', { keyPath: 'id' });
        }

        // Settings Store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = (event) => {
        console.error('IndexedDB open error:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });

    return this.initPromise;
  }

  private async getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    const tx = this.db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  }

  // --- SECTIONS ---
  public async getAllSections(): Promise<Section[]> {
    const store = await this.getStore('sections');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as Section[]);
      request.onerror = () => reject(request.error);
    });
  }

  public async saveSection(section: Section): Promise<void> {
    const store = await this.getStore('sections', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(section);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async deleteSection(id: string): Promise<void> {
    const store = await this.getStore('sections', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- CATEGORIES ---
  public async getAllCategories(): Promise<Category[]> {
    const store = await this.getStore('categories');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as Category[]);
      request.onerror = () => reject(request.error);
    });
  }

  public async saveCategory(category: Category): Promise<void> {
    const store = await this.getStore('categories', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(category);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async deleteCategory(id: string): Promise<void> {
    const store = await this.getStore('categories', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- PROMPTS ---
  public async getAllPrompts(): Promise<PromptItem[]> {
    const store = await this.getStore('prompts');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as PromptItem[]);
      request.onerror = () => reject(request.error);
    });
  }

  public async savePrompt(prompt: PromptItem): Promise<void> {
    const store = await this.getStore('prompts', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(prompt);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async bulkSavePrompts(prompts: PromptItem[]): Promise<void> {
    await this.init();
    if (!this.db) return;
    const tx = this.db.transaction('prompts', 'readwrite');
    const store = tx.objectStore('prompts');
    for (const item of prompts) {
      store.put(item);
    }
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public async deletePrompt(id: string): Promise<void> {
    const store = await this.getStore('prompts', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- TAGS ---
  public async getAllTags(): Promise<Tag[]> {
    const store = await this.getStore('tags');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as Tag[]);
      request.onerror = () => reject(request.error);
    });
  }

  public async saveTag(tag: Tag): Promise<void> {
    const store = await this.getStore('tags', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(tag);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async deleteTag(id: string): Promise<void> {
    const store = await this.getStore('tags', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- SETTINGS ---
  public async getSettings(): Promise<Partial<AppSettings> | null> {
    const store = await this.getStore('settings');
    return new Promise((resolve) => {
      const request = store.get('app_config');
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  }

  public async saveSettings(settings: AppSettings): Promise<void> {
    const store = await this.getStore('settings', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put({ key: 'app_config', data: settings });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- CLEAR / RESET ---
  public async clearAllData(): Promise<void> {
    await this.init();
    if (!this.db) return;
    const storeNames = ['sections', 'categories', 'prompts', 'tags', 'activityLogs', 'settings'];
    const tx = this.db.transaction(storeNames, 'readwrite');
    for (const name of storeNames) {
      tx.objectStore(name).clear();
    }
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const dbEngine = new IndexedDBEngine();
