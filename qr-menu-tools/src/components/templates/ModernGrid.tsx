import { MenuDoc } from '../../types/menu';

interface ModernGridProps {
  menu: MenuDoc;
}

const tagColors: Record<string, string> = {
  veg: 'bg-green-100 text-green-800',
  non_veg: 'bg-red-100 text-red-800',
  spicy: 'bg-orange-100 text-orange-800',
  new: 'bg-blue-100 text-blue-800',
  popular: 'bg-yellow-100 text-yellow-800',
  recommended: 'bg-purple-100 text-purple-800',
};

export default function ModernGrid({ menu }: ModernGridProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div 
        className="py-16 px-6 text-white"
        style={{ backgroundColor: menu.themeColor }}
      >
        <div className="max-w-7xl mx-auto text-center">
          {menu.logoUrl && (
            <div className="w-32 h-32 mx-auto mb-6 overflow-hidden rounded-full shadow-2xl border-4 border-white bg-white">
              <img 
                src={menu.logoUrl} 
                alt={menu.restaurantName}
                className="w-full h-full object-cover object-center"
              />
            </div>
          )}
          <h1 className="text-5xl font-bold mb-2">{menu.restaurantName}</h1>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {menu.sections.map((section) => (
          <div key={section.id} className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-900">
              {section.name}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.items.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {item.imageUrl && (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                      <span className="text-lg font-bold text-gray-900 whitespace-nowrap ml-2">
                        {menu.currency} {item.price.toFixed(2)}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span 
                          key={tag}
                          className={`px-2 py-1 text-xs rounded-full font-medium ${tagColors[tag]}`}
                        >
                          {tag.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
