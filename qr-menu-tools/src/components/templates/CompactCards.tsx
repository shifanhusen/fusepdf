import { MenuDoc } from '../../types/menu';

interface CompactCardsProps {
  menu: MenuDoc;
}

export default function CompactCards({ menu }: CompactCardsProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-gray-900/80 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          {menu.logoUrl && (
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
              <img 
                src={menu.logoUrl} 
                alt={menu.restaurantName}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <h1 className="text-2xl font-bold">{menu.restaurantName}</h1>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {menu.sections.map((section) => (
          <div key={section.id} className="mb-8">
            <h2 className="text-xl font-bold mb-4 px-2 text-gray-100">
              {section.name}
            </h2>
            
            <div className="space-y-3">
              {section.items.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex gap-3">
                    {item.imageUrl && (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h3 className="font-semibold text-white truncate">{item.name}</h3>
                        <span className="font-bold text-green-400 whitespace-nowrap text-sm">
                          {menu.currency} {item.price.toFixed(2)}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                          {item.description}
                        </p>
                      )}
                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag) => (
                            <span 
                              key={tag}
                              className="px-2 py-0.5 text-xs rounded-full bg-gray-700 text-gray-300"
                            >
                              {tag === 'veg' ? '🥬' : tag === 'non_veg' ? '🍖' : tag === 'spicy' ? '🌶️' : '⭐'}
                            </span>
                          ))}
                        </div>
                      )}
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
