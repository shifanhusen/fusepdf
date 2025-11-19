import { MenuDoc } from '../../types/menu';

interface ElegantMinimalProps {
  menu: MenuDoc;
}

export default function ElegantMinimal({ menu }: ElegantMinimalProps) {
  // Filter sections that have items with imageUrl (menu pages)
  const menuPages = menu.sections
    .flatMap(section => section.items)
    .filter(item => item.imageUrl)
    .map(item => ({
      imageUrl: item.imageUrl,
      name: item.name,
      description: item.description
    }));

  const hasMenuPages = menuPages.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              {menu.logoUrl && (
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                  <img 
                    src={menu.logoUrl} 
                    alt={menu.restaurantName}
                    className="w-full h-full object-contain"
                    style={{ objectFit: 'contain', objectPosition: 'center' }}
                  />
                </div>
              )}
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-gray-900">
                  {menu.restaurantName}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Digital Menu</p>
              </div>
            </div>
            {hasMenuPages && (
              <div className="text-right">
                <div className="text-xs sm:text-sm text-gray-500">Pages</div>
                <div className="text-lg sm:text-xl font-bold text-gray-900">{menuPages.length}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu Pages Display */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        {hasMenuPages ? (
          <div className="space-y-6 sm:space-y-8">
            {menuPages.map((page, index) => (
              <div key={index} className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden border border-gray-200">
                {/* Page Header */}
                {page.name && (
                  <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                        {page.name}
                      </h2>
                      <span className="text-xs sm:text-sm text-gray-500">
                        Page {index + 1} of {menuPages.length}
                      </span>
                    </div>
                    {page.description && (
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">{page.description}</p>
                    )}
                  </div>
                )}
                
                {/* Menu Image */}
                <div className="relative bg-gray-100">
                  <img 
                    src={page.imageUrl} 
                    alt={page.name || `Menu Page ${index + 1}`}
                    className="w-full h-auto"
                    style={{ 
                      maxHeight: '1200px',
                      objectFit: 'contain',
                      objectPosition: 'center'
                    }}
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Instructions when no menu pages uploaded
          <div className="max-w-2xl mx-auto text-center py-12 sm:py-16">
            <div className="bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300 p-6 sm:p-8 md:p-12">
              <div className="text-5xl sm:text-6xl mb-4">📋</div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                Digital Menu Pages
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                This template displays your existing menu as images. Perfect for restaurants 
                that already have professionally designed menus!
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 text-left space-y-3 sm:space-y-4">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                  <span>💡</span> How to use this template:
                </h3>
                <ol className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-700 list-decimal list-inside">
                  <li>Take clear photos of your physical menu pages (or use PDF images)</li>
                  <li>Upload images to a hosting service (Imgur, Google Drive, etc.)</li>
                  <li>Add each menu page as a separate item in any section</li>
                  <li>Paste the image URL in the "Item Image URL" field</li>
                  <li>Use the item name to label each page (e.g., "Main Courses", "Page 1")</li>
                </ol>
                
                <div className="pt-3 sm:pt-4 border-t border-blue-200">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 mb-2">
                    ✨ Best Practices:
                  </p>
                  <ul className="space-y-1 text-xs sm:text-sm text-gray-600">
                    <li>• Use high-resolution images (A4 size recommended: 2480x3508px)</li>
                    <li>• Ensure good lighting and clear text visibility</li>
                    <li>• Compress images to under 2MB for faster loading</li>
                    <li>• Number your pages in the item names for easy navigation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {hasMenuPages && (
        <div className="text-center py-6 sm:py-8 border-t border-gray-200 bg-gray-50">
          <p className="text-xs sm:text-sm text-gray-500">
            Powered by QR Menu Studio • {menuPages.length} {menuPages.length === 1 ? 'Page' : 'Pages'}
          </p>
        </div>
      )}
    </div>
  );
}
