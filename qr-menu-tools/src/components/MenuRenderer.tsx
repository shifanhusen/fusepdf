import { MenuDoc } from '../types/menu';
import ElegantMinimal from './templates/ElegantMinimal';
import ModernGrid from './templates/ModernGrid';
import ClassicList from './templates/ClassicList';
import PhotoShowcase from './templates/PhotoShowcase';
import CompactCards from './templates/CompactCards';
import ImageShowcase from './templates/ImageShowcase';

interface MenuRendererProps {
  menu: MenuDoc;
}

export default function MenuRenderer({ menu }: MenuRendererProps) {
  switch (menu.template) {
    case 'elegant-minimal':
      return <ElegantMinimal menu={menu} />;
    case 'modern-grid':
      return <ModernGrid menu={menu} />;
    case 'classic-list':
      return <ClassicList menu={menu} />;
    case 'photo-showcase':
      return <PhotoShowcase menu={menu} />;
    case 'compact-cards':
      return <CompactCards menu={menu} />;
    case 'image-showcase':
      return <ImageShowcase menu={menu} />;
    default:
      return <ElegantMinimal menu={menu} />;
  }
}
