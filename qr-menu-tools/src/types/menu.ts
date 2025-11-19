export type MenuItemTag = 'veg' | 'non_veg' | 'spicy' | 'new' | 'popular' | 'recommended';

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  tags: MenuItemTag[];
  imageUrl?: string;
  highlight?: boolean;
}

export interface MenuSection {
  id: string;
  name: string;
  items: MenuItem[];
}

export type MenuTemplate = 
  | 'elegant-minimal'
  | 'modern-grid'
  | 'classic-list'
  | 'photo-showcase'
  | 'compact-cards'
  | 'image-showcase';

export interface MenuDoc {
  id: string;
  userId: string; // Firebase Auth user ID
  slug?: string;
  restaurantName: string;
  logoUrl?: string;
  themeColor: string;
  currency: string;
  template: MenuTemplate;
  sections: MenuSection[];
  createdAt: string;
  updatedAt: string;
  editKey: string;
  deleted?: boolean;
  deletedAt?: string;
}
