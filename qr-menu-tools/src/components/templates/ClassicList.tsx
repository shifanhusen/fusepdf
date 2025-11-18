import { MenuDoc } from '../../types/menu';

interface ClassicListProps {
  menu: MenuDoc;
}

export default function ClassicList({ menu }: ClassicListProps) {
  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <div className="bg-amber-900 text-amber-50 py-12 px-6 border-b-4 border-amber-700">
        <div className="max-w-4xl mx-auto text-center">
          {menu.logoUrl && (
            <div className="w-28 h-28 mx-auto mb-6 overflow-hidden rounded-full border-4 border-amber-50 bg-amber-50">
              <img 
                src={menu.logoUrl} 
                alt={menu.restaurantName}
                className="w-full h-full object-cover object-center"
              />
            </div>
          )}
          <h1 className="text-4xl font-serif font-bold mb-2">{menu.restaurantName}</h1>
          <div className="flex items-center justify-center gap-2">
            <div className="w-12 h-0.5 bg-amber-400"></div>
            <div className="w-2 h-2 bg-amber-400 rotate-45"></div>
            <div className="w-12 h-0.5 bg-amber-400"></div>
          </div>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {menu.sections.map((section, sectionIndex) => (
          <div key={section.id} className={sectionIndex > 0 ? 'mt-12' : ''}>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif font-bold text-amber-900 inline-block border-b-2 border-amber-700 pb-2">
                {section.name}
              </h2>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border-2 border-amber-200 p-6">
              {section.items.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`${index > 0 ? 'border-t border-amber-200 pt-4 mt-4' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                        <div className="flex gap-1">
                          {item.tags.map((tag) => (
                            <span 
                              key={tag}
                              className="px-2 py-0.5 text-xs rounded bg-amber-100 text-amber-800 font-medium"
                            >
                              {tag === 'veg' ? '🥬' : tag === 'non_veg' ? '🍖' : tag === 'spicy' ? '🌶️' : '⭐'}
                            </span>
                          ))}
                        </div>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600">{item.description}</p>
                      )}
                    </div>
                    <div className="ml-4">
                      <span className="text-lg font-bold text-amber-900">
                        {menu.currency} {item.price.toFixed(2)}
                      </span>
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
