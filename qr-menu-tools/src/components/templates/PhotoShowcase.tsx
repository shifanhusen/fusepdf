import { MenuDoc } from '../../types/menu';

interface PhotoShowcaseProps {
  menu: MenuDoc;
}

export default function PhotoShowcase({ menu }: PhotoShowcaseProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="relative h-96 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black z-10"></div>
        {menu.logoUrl ? (
          <div className="w-full h-full overflow-hidden">
            <img 
              src={menu.logoUrl} 
              alt={menu.restaurantName}
              className="w-full h-full object-cover object-center opacity-40"
            />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800"></div>
        )}
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-4">{menu.restaurantName}</h1>
            <div className="w-32 h-1 bg-white mx-auto"></div>
          </div>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {menu.sections.map((section) => (
          <div key={section.id} className="mb-20">
            <h2 className="text-4xl font-bold mb-12 text-center uppercase tracking-widest">
              {section.name}
            </h2>
            
            <div className="space-y-8">
              {section.items.map((item) => (
                <div 
                  key={item.id} 
                  className="group relative overflow-hidden rounded-2xl"
                >
                  {item.imageUrl ? (
                    <div className="relative h-96">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-8">
                        <div className="flex justify-between items-end">
                          <div>
                            <h3 className="text-3xl font-bold mb-2">{item.name}</h3>
                            {item.description && (
                              <p className="text-gray-300 max-w-2xl">{item.description}</p>
                            )}
                            <div className="flex gap-2 mt-3">
                              {item.tags.map((tag) => (
                                <span 
                                  key={tag}
                                  className="px-3 py-1 text-sm rounded-full bg-white/20 backdrop-blur-sm"
                                >
                                  {tag.replace('_', ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-3xl font-bold">
                            {menu.currency} {item.price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-900 p-8 rounded-2xl">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-2xl font-bold mb-2">{item.name}</h3>
                          {item.description && (
                            <p className="text-gray-400">{item.description}</p>
                          )}
                          <div className="flex gap-2 mt-3">
                            {item.tags.map((tag) => (
                              <span 
                                key={tag}
                                className="px-3 py-1 text-sm rounded-full bg-white/10"
                              >
                                {tag.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-2xl font-bold ml-4">
                          {menu.currency} {item.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
