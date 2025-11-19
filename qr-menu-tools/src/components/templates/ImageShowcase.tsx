import { MenuDoc } from '../../types/menu';

interface ImageShowcaseProps {
  menu: MenuDoc;
}

export default function ImageShowcase({ menu }: ImageShowcaseProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm py-8 px-6 sticky top-0 z-10 border-b border-gray-700">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {menu.logoUrl && (
              <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center overflow-hidden backdrop-blur-sm">
                <img 
                  src={menu.logoUrl} 
                  alt={menu.restaurantName}
                  className="w-full h-full object-contain"
                  style={{ objectFit: 'contain', objectPosition: 'center' }}
                />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white">{menu.restaurantName}</h1>
              <p className="text-gray-300 text-sm">Visual Menu Experience</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400 uppercase tracking-wide">Menu</div>
            <div className="text-white font-semibold">Gallery</div>
          </div>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {menu.sections.map((section, sectionIndex) => (
          <div key={section.id} className={sectionIndex > 0 ? 'mt-16' : ''}>
            {/* Section Header */}
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-2">{section.name}</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
            </div>
            
            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.items.map((item) => (
                <div 
                  key={item.id}
                  className="group bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  {/* Item Image */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-gray-700 to-gray-800 relative overflow-hidden">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        style={{ objectFit: 'cover', objectPosition: 'center' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-600 to-gray-700">
                        <div className="text-center">
                          <div className="text-4xl mb-2">🍽️</div>
                          <div className="text-gray-300 text-sm">No Image</div>
                        </div>
                      </div>
                    )}
                    
                    {/* Price Overlay */}
                    <div className="absolute top-4 right-4">
                      <div className="bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-white font-bold text-sm">
                          {menu.currency} {item.price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Tags Overlay */}
                    {item.tags.length > 0 && (
                      <div className="absolute bottom-4 left-4">
                        <div className="flex gap-1">
                          {item.tags.slice(0, 3).map((tag) => (
                            <span 
                              key={tag}
                              className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-xs"
                            >
                              {tag === 'veg' ? '🥬' : 
                               tag === 'non_veg' ? '🍖' : 
                               tag === 'spicy' ? '🌶️' : 
                               tag === 'new' ? '✨' : 
                               tag === 'popular' ? '🔥' : '⭐'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-gray-300 text-sm leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    
                    {/* Highlight Badge */}
                    {item.highlight && (
                      <div className="mt-3">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-semibold rounded-full">
                          ⭐ Featured
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center py-8 border-t border-gray-700 mt-16">
        <p className="text-gray-400 text-sm">
          Powered by QR Menu Studio
        </p>
      </div>
    </div>
  );
}