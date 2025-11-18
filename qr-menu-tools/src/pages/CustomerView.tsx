import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MenuDoc } from '../types/menu';
import { getMenu } from '../data/menuApi';
import MenuRenderer from '../components/MenuRenderer';

export default function CustomerView() {
  const { menuId } = useParams<{ menuId: string }>();
  const [menu, setMenu] = useState<MenuDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (menuId) {
      getMenu(menuId).then(m => {
        setMenu(m);
        setLoading(false);
      });
    }
  }, [menuId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-900 dark:text-white">Loading menu...</div>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">😕 Menu Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This menu doesn't exist or has been removed.
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Please contact the restaurant for the correct menu link.
          </p>
        </div>
      </div>
    );
  }

  return <MenuRenderer menu={menu} />;
}
