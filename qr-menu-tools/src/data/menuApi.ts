import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { MenuDoc } from '../types/menu';

// Generate a random ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Generate a random edit key
function generateEditKey(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Create a new menu
export async function createMenu(menu: Partial<MenuDoc>, userId: string): Promise<MenuDoc> {
  const id = generateId();
  const editKey = generateEditKey();
  
  const newMenu: MenuDoc = {
    id,
    editKey,
    userId,
    restaurantName: menu.restaurantName || 'My Restaurant',
    logoUrl: menu.logoUrl,
    themeColor: menu.themeColor || '#0082FF',
    currency: menu.currency || 'MVR',
    template: menu.template || 'elegant-minimal',
    sections: menu.sections || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  await setDoc(doc(db, 'menus', id), {
    ...newMenu,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  return newMenu;
}

// Update an existing menu
export async function updateMenu(menuId: string, updates: Partial<MenuDoc>, userId: string): Promise<MenuDoc> {
  const menuRef = doc(db, 'menus', menuId);
  const menuSnap = await getDoc(menuRef);
  
  if (!menuSnap.exists()) {
    throw new Error('Menu not found');
  }
  
  const existingMenu = menuSnap.data() as MenuDoc;
  
  // Check if user owns this menu
  if (existingMenu.userId !== userId) {
    throw new Error('Unauthorized: You do not own this menu');
  }
  
  const updatedData = {
    ...updates,
    updatedAt: serverTimestamp(),
  };
  
  await updateDoc(menuRef, updatedData);
  
  const updatedSnap = await getDoc(menuRef);
  const data = updatedSnap.data();
  
  if (!data) {
    throw new Error('Menu not found after update');
  }
  
  return {
    ...data,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
  } as MenuDoc;
}

// Get a menu by ID (public access)
export async function getMenu(menuId: string): Promise<MenuDoc | null> {
  const menuRef = doc(db, 'menus', menuId);
  const menuSnap = await getDoc(menuRef);
  
  if (!menuSnap.exists()) {
    return null;
  }
  
  const data = menuSnap.data();
  
  // Convert Firestore timestamps to ISO strings
  return {
    ...data,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
  } as MenuDoc;
}

// Get all menus for a user
export async function getUserMenus(userId: string): Promise<MenuDoc[]> {
  const menusRef = collection(db, 'menus');
  const q = query(menusRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
    } as MenuDoc;
  });
}

// Delete a menu
export async function deleteMenu(menuId: string, userId: string): Promise<void> {
  const menuRef = doc(db, 'menus', menuId);
  const menuSnap = await getDoc(menuRef);
  
  if (!menuSnap.exists()) {
    throw new Error('Menu not found');
  }
  
  const existingMenu = menuSnap.data() as MenuDoc;
  
  // Check if user owns this menu
  if (existingMenu.userId !== userId) {
    throw new Error('Unauthorized: You do not own this menu');
  }
  
  await updateDoc(menuRef, {
    deleted: true,
    deletedAt: serverTimestamp(),
  });
}

// LocalStorage helpers for draft recovery (optional)
const LAST_EDITED_KEY = 'qr_last_edited_menu';

export function saveLastEditedMenu(menu: Partial<MenuDoc>): void {
  localStorage.setItem(LAST_EDITED_KEY, JSON.stringify(menu));
}

export function getLastEditedMenu(): Partial<MenuDoc> | null {
  const data = localStorage.getItem(LAST_EDITED_KEY);
  return data ? JSON.parse(data) : null;
}

export function clearLastEditedMenu(): void {
  localStorage.removeItem(LAST_EDITED_KEY);
}
