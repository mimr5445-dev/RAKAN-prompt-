/**
 * RAKAN Prompt - Firebase Cloud Synchronization & Authentication Service
 * Manages Google Sign-In, permanent session restoration, offline persistence,
 * and automatic background synchronization with Firestore.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  User,
  Auth
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  Firestore
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Section, Category, PromptItem, Tag, AppSettings } from '../types';

export type SyncStatus = 'offline' | 'saving' | 'synced';

/**
 * Recursively strips undefined values from objects and arrays so Firestore setDoc / batch.set won't fail.
 */
function sanitizeForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as any;
  }
  if (typeof obj !== 'object') {
    return obj;
  }
  if (obj instanceof Date) {
    return obj.toISOString() as any;
  }
  if (Array.isArray(obj)) {
    return obj
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as any;
  }
  const result: any = {};
  for (const key of Object.keys(obj)) {
    const val = (obj as any)[key];
    if (val !== undefined) {
      result[key] = sanitizeForFirestore(val);
    }
  }
  return result;
}

class FirebaseService {
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private db: Firestore | null = null;
  private currentUser: User | null = null;
  private syncStatus: SyncStatus = 'offline';
  private syncStatusListeners: ((status: SyncStatus) => void)[] = [];
  private isSyncing = false;
  private deletedIdsKey = 'rakan_deleted_ids';

  constructor() {
    this.init();
  }

  private init() {
    if (getApps().length === 0) {
      this.app = initializeApp(firebaseConfig);
    } else {
      this.app = getApp();
    }
    this.auth = getAuth(this.app);
    const dbId = firebaseConfig.firestoreDatabaseId || '(default)';
    try {
      this.db = initializeFirestore(this.app, { ignoreUndefinedProperties: true }, dbId);
    } catch (err) {
      this.db = getFirestore(this.app, dbId);
    }

    // Set permanent session persistence
    setPersistence(this.auth, browserLocalPersistence).catch((err) => {
      console.error('Failed to set auth persistence:', err);
    });

    // Listen to network changes for offline/online status indicator
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        if (this.currentUser) {
          this.setSyncStatus('synced');
          // Automatically trigger sync when coming back online
          this.notifyOnlineReturn();
        } else {
          this.setSyncStatus('offline');
        }
      });
      window.addEventListener('offline', () => {
        this.setSyncStatus('offline');
      });
      if (!navigator.onLine) {
        this.setSyncStatus('offline');
      }
    }
  }

  private setSyncStatus(status: SyncStatus) {
    if (!navigator.onLine && status !== 'offline') {
      status = 'offline';
    }
    this.syncStatus = status;
    this.syncStatusListeners.forEach((fn) => fn(status));
  }

  public getSyncStatus(): SyncStatus {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return 'offline';
    }
    return this.syncStatus;
  }

  public subscribeSyncStatus(listener: (status: SyncStatus) => void): () => void {
    this.syncStatusListeners.push(listener);
    listener(this.getSyncStatus());
    return () => {
      this.syncStatusListeners = this.syncStatusListeners.filter((fn) => fn !== listener);
    };
  }

  public onAuthChange(callback: (user: User | null) => void): () => void {
    if (!this.auth) return () => {};
    return onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
      if (user) {
        if (navigator.onLine) {
          this.setSyncStatus('synced');
        } else {
          this.setSyncStatus('offline');
        }
      } else {
        this.setSyncStatus('offline');
      }
      callback(user);
    });
  }

  public async signInWithGoogle(): Promise<User | null> {
    if (!this.auth) return null;
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(this.auth, provider);
      this.currentUser = result.user;
      await this.ensureUserProfile(result.user);
      return result.user;
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  }

  public async switchAccount(): Promise<User | null> {
    if (!this.auth) return null;
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(this.auth, provider);
      this.currentUser = result.user;
      await this.ensureUserProfile(result.user);
      return result.user;
    } catch (error: any) {
      console.error('Switch Account Error:', error);
      throw error;
    }
  }

  public async logout(): Promise<void> {
    if (!this.auth) return;
    await signOut(this.auth);
    this.currentUser = null;
    this.setSyncStatus('offline');
  }

  public getCurrentUser(): User | null {
    return this.currentUser || (this.auth ? this.auth.currentUser : null);
  }

  private async ensureUserProfile(user: User): Promise<void> {
    if (!this.db) return;
    const userDocRef = doc(this.db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        createdAt: new Date().toISOString(),
        lastSyncedAt: new Date().toISOString()
      }, { merge: true });
    } else {
      await setDoc(userDocRef, {
        lastSyncedAt: new Date().toISOString()
      }, { merge: true });
    }
  }

  // --- LOCAL OFFLINE DELETION TRACKER ---
  public trackDeletedId(id: string): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const deleted = JSON.parse(localStorage.getItem(this.deletedIdsKey) || '[]');
      if (!deleted.includes(id)) {
        deleted.push(id);
        localStorage.setItem(this.deletedIdsKey, JSON.stringify(deleted));
      }
    } catch (e) {
      console.error('Error tracking deleted id:', e);
    }
  }

  private getDeletedIds(): string[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(this.deletedIdsKey) || '[]');
    } catch (e) {
      return [];
    }
  }

  private clearDeletedId(id: string): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const deleted = JSON.parse(localStorage.getItem(this.deletedIdsKey) || '[]');
      const updated = deleted.filter((item: string) => item !== id);
      localStorage.setItem(this.deletedIdsKey, JSON.stringify(updated));
    } catch (e) {
      console.error('Error clearing deleted id:', e);
    }
  }

  // --- FULL BACKGROUND SYNC ---
  private onlineReturnCallback: (() => void) | null = null;
  public setOnlineReturnHandler(cb: () => void): void {
    this.onlineReturnCallback = cb;
  }
  private notifyOnlineReturn(): void {
    if (this.onlineReturnCallback) {
      this.onlineReturnCallback();
    }
  }

  public async performFullSync(
    uid: string,
    localSections: Section[],
    localCategories: Category[],
    localPrompts: PromptItem[],
    localTags: Tag[],
    localSettings: AppSettings,
    onDataUpdated: (
      sections: Section[],
      categories: Category[],
      prompts: PromptItem[],
      tags: Tag[],
      settings: AppSettings
    ) => Promise<void>
  ): Promise<void> {
    if (!this.db || !uid || !navigator.onLine || this.isSyncing) return;

    try {
      this.isSyncing = true;
      this.setSyncStatus('saving');

      await this.ensureUserProfile({ uid } as User);

      const deletedIds = this.getDeletedIds();

      // 1. Fetch Cloud Data
      const sectionsColl = collection(this.db, 'users', uid, 'sections');
      const categoriesColl = collection(this.db, 'users', uid, 'categories');
      const promptsColl = collection(this.db, 'users', uid, 'prompts');
      const tagsColl = collection(this.db, 'users', uid, 'tags');
      const settingsDocRef = doc(this.db, 'users', uid, 'settings', 'app_config');

      const [secSnap, catSnap, prmSnap, tagSnap, setSnap] = await Promise.all([
        getDocs(sectionsColl),
        getDocs(categoriesColl),
        getDocs(promptsColl),
        getDocs(tagsColl),
        getDoc(settingsDocRef)
      ]);

      const cloudSections: Section[] = [];
      secSnap.forEach((docSnap) => cloudSections.push(docSnap.data() as Section));

      const cloudCategories: Category[] = [];
      catSnap.forEach((docSnap) => cloudCategories.push(docSnap.data() as Category));

      const cloudPrompts: PromptItem[] = [];
      prmSnap.forEach((docSnap) => cloudPrompts.push(docSnap.data() as PromptItem));

      const cloudTags: Tag[] = [];
      tagSnap.forEach((docSnap) => cloudTags.push(docSnap.data() as Tag));

      const cloudSettings = setSnap.exists() ? (setSnap.data() as AppSettings) : null;

      // 2. Merge Sections
      const mergedSectionsMap = new Map<string, Section>();
      const sectionsToUpload: Section[] = [];
      const sectionsToDeleteFromCloud: string[] = [];

      for (const loc of localSections) {
        mergedSectionsMap.set(loc.id, loc);
      }
      for (const cld of cloudSections) {
        if (deletedIds.includes(cld.id)) {
          sectionsToDeleteFromCloud.push(cld.id);
          continue;
        }
        const loc = mergedSectionsMap.get(cld.id);
        if (!loc) {
          mergedSectionsMap.set(cld.id, cld);
        } else {
          const locTime = new Date(loc.updatedAt || loc.createdAt || 0).getTime();
          const cldTime = new Date(cld.updatedAt || cld.createdAt || 0).getTime();
          if (cldTime > locTime) {
            mergedSectionsMap.set(cld.id, cld);
          } else if (locTime > cldTime) {
            sectionsToUpload.push(loc);
          }
        }
      }
      for (const loc of localSections) {
        if (!cloudSections.some((c) => c.id === loc.id) && !deletedIds.includes(loc.id)) {
          sectionsToUpload.push(loc);
        }
      }

      // 3. Merge Categories
      const mergedCategoriesMap = new Map<string, Category>();
      const categoriesToUpload: Category[] = [];
      const categoriesToDeleteFromCloud: string[] = [];

      for (const loc of localCategories) {
        mergedCategoriesMap.set(loc.id, loc);
      }
      for (const cld of cloudCategories) {
        if (deletedIds.includes(cld.id)) {
          categoriesToDeleteFromCloud.push(cld.id);
          continue;
        }
        const loc = mergedCategoriesMap.get(cld.id);
        if (!loc) {
          mergedCategoriesMap.set(cld.id, cld);
        } else {
          const locTime = new Date(loc.updatedAt || loc.createdAt || 0).getTime();
          const cldTime = new Date(cld.updatedAt || cld.createdAt || 0).getTime();
          if (cldTime > locTime) {
            mergedCategoriesMap.set(cld.id, cld);
          } else if (locTime > cldTime) {
            categoriesToUpload.push(loc);
          }
        }
      }
      for (const loc of localCategories) {
        if (!cloudCategories.some((c) => c.id === loc.id) && !deletedIds.includes(loc.id)) {
          categoriesToUpload.push(loc);
        }
      }

      // 4. Merge Prompts
      const mergedPromptsMap = new Map<string, PromptItem>();
      const promptsToUpload: PromptItem[] = [];
      const promptsToDeleteFromCloud: string[] = [];

      for (const loc of localPrompts) {
        mergedPromptsMap.set(loc.id, loc);
      }
      for (const cld of cloudPrompts) {
        if (deletedIds.includes(cld.id)) {
          promptsToDeleteFromCloud.push(cld.id);
          continue;
        }
        const loc = mergedPromptsMap.get(cld.id);
        if (!loc) {
          mergedPromptsMap.set(cld.id, cld);
        } else {
          const locTime = new Date(loc.updatedAt || loc.createdAt || 0).getTime();
          const cldTime = new Date(cld.updatedAt || cld.createdAt || 0).getTime();
          if (cldTime > locTime) {
            mergedPromptsMap.set(cld.id, cld);
          } else if (locTime > cldTime) {
            promptsToUpload.push(loc);
          }
        }
      }
      for (const loc of localPrompts) {
        if (!cloudPrompts.some((c) => c.id === loc.id) && !deletedIds.includes(loc.id)) {
          promptsToUpload.push(loc);
        }
      }

      // 5. Merge Tags
      const mergedTagsMap = new Map<string, Tag>();
      const tagsToUpload: Tag[] = [];
      const tagsToDeleteFromCloud: string[] = [];

      for (const loc of localTags) {
        mergedTagsMap.set(loc.id, loc);
      }
      for (const cld of cloudTags) {
        if (deletedIds.includes(cld.id)) {
          tagsToDeleteFromCloud.push(cld.id);
          continue;
        }
        const loc = mergedTagsMap.get(cld.id);
        if (!loc) {
          mergedTagsMap.set(cld.id, cld);
        }
      }
      for (const loc of localTags) {
        if (!cloudTags.some((c) => c.id === loc.id) && !deletedIds.includes(loc.id)) {
          tagsToUpload.push(loc);
        }
      }

      // 6. Merge Settings
      let mergedSettings = { ...localSettings };
      let uploadSettings = false;
      if (cloudSettings) {
        mergedSettings = { ...localSettings, ...cloudSettings };
      } else {
        uploadSettings = true;
      }

      // 7. Perform Cloud Deletions & Uploads in Batches (max 450 per batch)
      const batchWrites: Promise<void>[] = [];
      let batch = writeBatch(this.db!);
      let count = 0;

      const commitBatchIfNeeded = async () => {
        if (count >= 400) {
          batchWrites.push(batch.commit());
          batch = writeBatch(this.db!);
          count = 0;
        }
      };

      for (const id of sectionsToDeleteFromCloud) {
        batch.delete(doc(this.db, 'users', uid, 'sections', id));
        count++;
        this.clearDeletedId(id);
        await commitBatchIfNeeded();
      }
      for (const id of categoriesToDeleteFromCloud) {
        batch.delete(doc(this.db, 'users', uid, 'categories', id));
        count++;
        this.clearDeletedId(id);
        await commitBatchIfNeeded();
      }
      for (const id of promptsToDeleteFromCloud) {
        batch.delete(doc(this.db, 'users', uid, 'prompts', id));
        count++;
        this.clearDeletedId(id);
        await commitBatchIfNeeded();
      }
      for (const id of tagsToDeleteFromCloud) {
        batch.delete(doc(this.db, 'users', uid, 'tags', id));
        count++;
        this.clearDeletedId(id);
        await commitBatchIfNeeded();
      }
      for (const sec of sectionsToUpload) {
        batch.set(doc(this.db, 'users', uid, 'sections', sec.id), sanitizeForFirestore(sec), { merge: true });
        count++;
        await commitBatchIfNeeded();
      }
      for (const cat of categoriesToUpload) {
        batch.set(doc(this.db, 'users', uid, 'categories', cat.id), sanitizeForFirestore(cat), { merge: true });
        count++;
        await commitBatchIfNeeded();
      }
      for (const prm of promptsToUpload) {
        batch.set(doc(this.db, 'users', uid, 'prompts', prm.id), sanitizeForFirestore(prm), { merge: true });
        count++;
        await commitBatchIfNeeded();
      }
      for (const tag of tagsToUpload) {
        batch.set(doc(this.db, 'users', uid, 'tags', tag.id), sanitizeForFirestore(tag), { merge: true });
        count++;
        await commitBatchIfNeeded();
      }
      if (uploadSettings) {
        batch.set(doc(this.db, 'users', uid, 'settings', 'app_config'), sanitizeForFirestore(mergedSettings), { merge: true });
        count++;
      }

      if (count > 0) {
        batchWrites.push(batch.commit());
      }

      await Promise.all(batchWrites);

      // Clear any remaining deletedIds that were processed
      for (const id of deletedIds) {
        this.clearDeletedId(id);
      }

      // 8. Update Local DB and AppContext state with final merged data
      const finalSections = Array.from(mergedSectionsMap.values()).sort((a, b) => a.order - b.order);
      const finalCategories = Array.from(mergedCategoriesMap.values()).sort((a, b) => a.order - b.order);
      const finalPrompts = Array.from(mergedPromptsMap.values());
      const finalTags = Array.from(mergedTagsMap.values());

      await onDataUpdated(finalSections, finalCategories, finalPrompts, finalTags, mergedSettings);

      this.setSyncStatus('synced');
    } catch (error) {
      console.error('Error during full sync:', error);
      this.setSyncStatus('offline');
    } finally {
      this.isSyncing = false;
    }
  }

  // --- IMMEDIATE EDIT SAVERS ---
  public async saveSectionToCloud(uid: string, section: Section): Promise<void> {
    if (!this.db || !uid || !navigator.onLine) return;
    try {
      this.setSyncStatus('saving');
      await setDoc(doc(this.db, 'users', uid, 'sections', section.id), sanitizeForFirestore(section), { merge: true });
      this.setSyncStatus('synced');
    } catch (error) {
      console.error('Failed saving section to cloud:', error);
      this.setSyncStatus('offline');
    }
  }

  public async deleteSectionFromCloud(uid: string, id: string): Promise<void> {
    this.trackDeletedId(id);
    if (!this.db || !uid || !navigator.onLine) return;
    try {
      this.setSyncStatus('saving');
      await deleteDoc(doc(this.db, 'users', uid, 'sections', id));
      this.clearDeletedId(id);
      this.setSyncStatus('synced');
    } catch (error) {
      console.error('Failed deleting section from cloud:', error);
      this.setSyncStatus('offline');
    }
  }

  public async saveCategoryToCloud(uid: string, category: Category): Promise<void> {
    if (!this.db || !uid || !navigator.onLine) return;
    try {
      this.setSyncStatus('saving');
      await setDoc(doc(this.db, 'users', uid, 'categories', category.id), sanitizeForFirestore(category), { merge: true });
      this.setSyncStatus('synced');
    } catch (error) {
      console.error('Failed saving category to cloud:', error);
      this.setSyncStatus('offline');
    }
  }

  public async deleteCategoryFromCloud(uid: string, id: string): Promise<void> {
    this.trackDeletedId(id);
    if (!this.db || !uid || !navigator.onLine) return;
    try {
      this.setSyncStatus('saving');
      await deleteDoc(doc(this.db, 'users', uid, 'categories', id));
      this.clearDeletedId(id);
      this.setSyncStatus('synced');
    } catch (error) {
      console.error('Failed deleting category from cloud:', error);
      this.setSyncStatus('offline');
    }
  }

  public async savePromptToCloud(uid: string, prompt: PromptItem): Promise<void> {
    if (!this.db || !uid || !navigator.onLine) return;
    try {
      this.setSyncStatus('saving');
      await setDoc(doc(this.db, 'users', uid, 'prompts', prompt.id), sanitizeForFirestore(prompt), { merge: true });
      this.setSyncStatus('synced');
    } catch (error) {
      console.error('Failed saving prompt to cloud:', error);
      this.setSyncStatus('offline');
    }
  }

  public async deletePromptFromCloud(uid: string, id: string): Promise<void> {
    this.trackDeletedId(id);
    if (!this.db || !uid || !navigator.onLine) return;
    try {
      this.setSyncStatus('saving');
      await deleteDoc(doc(this.db, 'users', uid, 'prompts', id));
      this.clearDeletedId(id);
      this.setSyncStatus('synced');
    } catch (error) {
      console.error('Failed deleting prompt from cloud:', error);
      this.setSyncStatus('offline');
    }
  }

  public async saveTagToCloud(uid: string, tag: Tag): Promise<void> {
    if (!this.db || !uid || !navigator.onLine) return;
    try {
      this.setSyncStatus('saving');
      await setDoc(doc(this.db, 'users', uid, 'tags', tag.id), sanitizeForFirestore(tag), { merge: true });
      this.setSyncStatus('synced');
    } catch (error) {
      console.error('Failed saving tag to cloud:', error);
      this.setSyncStatus('offline');
    }
  }

  public async deleteTagFromCloud(uid: string, id: string): Promise<void> {
    this.trackDeletedId(id);
    if (!this.db || !uid || !navigator.onLine) return;
    try {
      this.setSyncStatus('saving');
      await deleteDoc(doc(this.db, 'users', uid, 'tags', id));
      this.clearDeletedId(id);
      this.setSyncStatus('synced');
    } catch (error) {
      console.error('Failed deleting tag from cloud:', error);
      this.setSyncStatus('offline');
    }
  }

  public async saveSettingsToCloud(uid: string, settings: AppSettings): Promise<void> {
    if (!this.db || !uid || !navigator.onLine) return;
    try {
      this.setSyncStatus('saving');
      await setDoc(doc(this.db, 'users', uid, 'settings', 'app_config'), sanitizeForFirestore(settings), { merge: true });
      this.setSyncStatus('synced');
    } catch (error) {
      console.error('Failed saving settings to cloud:', error);
      this.setSyncStatus('offline');
    }
  }
}

export const firebaseService = new FirebaseService();
