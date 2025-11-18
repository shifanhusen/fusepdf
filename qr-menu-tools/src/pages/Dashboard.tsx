import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserMenus, deleteMenu } from '../data/menuApi';
import { MenuDoc } from '../types/menu';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [menus, setMenus] = useState<MenuDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    loadMenus();
  }, [user, navigate]);

  const loadMenus = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userMenus = await getUserMenus(user.uid);
      setMenus(userMenus.filter(m => !m.deleted));
    } catch (error) {
      console.error('Error loading menus:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (menuId: string) => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to delete this menu?')) {
      return;
    }

    try {
      await deleteMenu(menuId, user.uid);
      setMenus(menus.filter(m => m.id !== menuId));
    } catch (error) {
      console.error('Error deleting menu:', error);
      alert('Failed to delete menu');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your menus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">QR Menu Studio</h1>
              {user && (
                <div className="flex items-center gap-2">
                  <img 
                    src={user.photoURL || ''} 
                    alt={user.displayName || ''} 
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{user.displayName}</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Link
                to="/creator"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Create New Menu
              </Link>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {menus.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No menus yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first menu to get started</p>
            <Link
              to="/creator"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Menu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menus.map((menu) => (
              <div
                key={menu.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                {menu.logoUrl && (
                  <div 
                    className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                    style={{ backgroundColor: menu.themeColor }}
                  >
                    <img 
                      src={menu.logoUrl} 
                      alt={menu.restaurantName}
                      className="h-20 w-20 rounded-full object-cover border-4 border-white"
                    />
                  </div>
                )}
                {!menu.logoUrl && (
                  <div 
                    className="h-32 flex items-center justify-center"
                    style={{ backgroundColor: menu.themeColor }}
                  >
                    <span className="text-4xl text-white font-bold">
                      {menu.restaurantName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {menu.restaurantName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Template: <span className="capitalize">{menu.template.replace('-', ' ')}</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {menu.sections.length} section{menu.sections.length !== 1 ? 's' : ''} • {' '}
                    {menu.sections.reduce((acc, s) => acc + s.items.length, 0)} items
                  </p>

                  <div className="flex gap-2">
                    <Link
                      to={`/m/${menu.id}`}
                      target="_blank"
                      className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center text-sm"
                    >
                      View
                    </Link>
                    <Link
                      to={`/edit/${menu.id}`}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(menu.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
