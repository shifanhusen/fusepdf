import { MenuDoc } from '../../types/menu';

interface ElegantMinimalProps {
  menu: MenuDoc;
}

const tagIcons: Record<string, string> = {
  veg: '🥬',
  non_veg: '🍖',
  spicy: '🌶️',
  new: '✨',
  popular: '⭐',
  recommended: '👌',
};

export default function ElegantMinimal({ menu }: ElegantMinimalProps) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-6 py-12 text-center border-b border-gray-200">
        {menu.logoUrl && (
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
            <img 
              src={menu.logoUrl} 
              alt={menu.restaurantName}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <h1 className="text-4xl font-serif font-bold mb-2">{menu.restaurantName}</h1>
        <div className="w-16 h-1 bg-gray-900 mx-auto"></div>
      </div>

      {/* Menu Sections */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {menu.sections.map((section) => (
          <div key={section.id} className="mb-16">
            <h2 className="text-2xl font-serif font-bold text-center mb-8 uppercase tracking-wider">
              {section.name}
            </h2>
            
            <div className="space-y-6">
              {section.items.map((item) => (
                <div key={item.id} className="border-b border-gray-200 pb-6 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                        {item.tags.map((tag) => (
                          <span key={tag} className="text-sm">
                            {tagIcons[tag]}
                          </span>
                        ))}
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="ml-4 text-lg font-semibold whitespace-nowrap">
                      {menu.currency} {item.price.toFixed(2)}
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
