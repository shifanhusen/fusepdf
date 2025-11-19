import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MenuDoc, MenuSection, MenuItem, MenuTemplate } from '../types/menu';
import { createMenu, updateMenu, getMenu, saveLastEditedMenu, clearLastEditedMenu } from '../data/menuApi';
import { QrPreview } from '../components/QrPreview';
import { useAuth } from '../contexts/AuthContext';
import TemplateSelector from '../components/TemplateSelector';
import ImageUrlInput from '../components/ImageUrlInput';

const THEME_PRESETS = [
  { name: 'Blue', color: '#0082FF' },
  { name: 'Green', color: '#00D688' },
  { name: 'Purple', color: '#9333EA' },
  { name: 'Red', color: '#EF4444' },
  { name: 'Orange', color: '#F59E0B' },
];

export const Creator: React.FC = () => {
  const navigate = useNavigate();
  const { menuId } = useParams<{ menuId: string }>();
  const { user } = useAuth();
  const [step, setStep] = useState(0); // Start at 0 for template selection
  const [publishedMenu, setPublishedMenu] = useState<MenuDoc | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [restaurantName, setRestaurantName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [themeColor, setThemeColor] = useState('#0082FF');
  const [currency, setCurrency] = useState('MVR');
  const [template, setTemplate] = useState<MenuTemplate>('elegant-minimal');
  const [sections, setSections] = useState<MenuSection[]>([]);

  // Load existing menu if editing
  useEffect(() => {
    if (menuId) {
      setLoading(true);
      getMenu(menuId).then(menu => {
        if (menu) {
          setRestaurantName(menu.restaurantName);
          setLogoUrl(menu.logoUrl || '');
          setThemeColor(menu.themeColor);
          setCurrency(menu.currency);
          setTemplate(menu.template);
          setSections(menu.sections);
          setStep(2); // Skip to menu editor when editing
        }
        setLoading(false);
      });
    }
  }, [menuId]);

  // Save progress
  React.useEffect(() => {
    if (step > 1 && !publishedMenu) {
      saveLastEditedMenu({
        restaurantName,
        logoUrl,
        themeColor,
        currency,
        template,
        sections,
      });
    }
  }, [restaurantName, logoUrl, themeColor, currency, template, sections, step, publishedMenu]);

  const addSection = () => {
    setSections([...sections, {
      id: `section-${Date.now()}`,
      name: 'New Section',
      items: [],
    }]);
  };

  const updateSection = (id: string, name: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, name } : s));
  };

  const deleteSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const addItem = (sectionId: string) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          items: [...s.items, {
            id: `item-${Date.now()}`,
            name: 'New Item',
            description: '',
            price: 0,
            tags: [],
          }],
        };
      }
      return s;
    }));
  };

  const updateItem = (sectionId: string, itemId: string, updates: Partial<MenuItem>) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          items: s.items.map(i => i.id === itemId ? { ...i, ...updates } : i),
        };
      }
      return s;
    }));
  };

  const deleteItem = (sectionId: string, itemId: string) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          items: s.items.filter(i => i.id !== itemId),
        };
      }
      return s;
    }));
  };

  const handlePublish = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let menu: MenuDoc;
      if (menuId) {
        // Update existing menu
        menu = await updateMenu(menuId, {
          restaurantName,
          logoUrl,
          themeColor,
          currency,
          template,
          sections,
        }, user.uid);
      } else {
        // Create new menu
        menu = await createMenu({
          restaurantName,
          logoUrl,
          themeColor,
          currency,
          template,
          sections,
        }, user.uid);
      }
      setPublishedMenu(menu);
      clearLastEditedMenu();
    } catch (error) {
      console.error('Error publishing menu:', error);
      alert('Failed to publish menu. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (publishedMenu) {
    const publicUrl = `${window.location.origin}/qr-menu/m/${publishedMenu.id}`;
    const editUrl = `${window.location.origin}/qr-menu/edit/${publishedMenu.id}?key=${publishedMenu.editKey}`;

    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">🎉 Your Menu is Live!</h1>
            <p className="text-gray-400">Share this QR code with your customers</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-8 mb-6">
            <div className="flex flex-col items-center gap-6">
              <QrPreview url={publicUrl} themeColor={themeColor} logoUrl={logoUrl} />
              
              <div className="w-full space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Public Menu Link</label>
                  <input
                    type="text"
                    value={publicUrl}
                    readOnly
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Edit Link (Keep this private!)</label>
                  <input
                    type="text"
                    value={editUrl}
                    readOnly
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => window.open(`/qr-menu/m/${publishedMenu.id}`, '_blank')}
                  className="px-6 py-3 bg-primary-blue rounded-lg hover:bg-blue-600"
                >
                  View Menu
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 bg-gray-700 rounded-lg hover:bg-gray-600"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">QR Menu Studio</h1>
          <div className="flex items-center gap-2 mt-4">
            {['Template', 'Info', 'Menu'].map((label, idx) => (
              <div key={idx} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    idx === step ? 'bg-primary-blue' : idx < step ? 'bg-primary-green' : 'bg-gray-700'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className="text-xs mt-1 text-gray-400">{label}</span>
                </div>
                {idx < 2 && <div className="w-12 h-0.5 bg-gray-700 mx-2 mt-[-16px]" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Step 0: Template Selection */}
        {step === 0 && (
          <div className="max-w-4xl mx-auto space-y-6">
            <TemplateSelector 
              selectedTemplate={template} 
              onSelect={(t) => setTemplate(t)} 
            />
            
            {/* Digital Menu Pages Template Info */}
            {template === 'elegant-minimal' && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">📋</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Digital Menu Pages - Quick Setup Guide
                    </h3>
                    <p className="text-sm text-gray-700 mb-4">
                      Perfect for displaying your existing physical menu! Simply upload photos of your menu pages.
                    </p>
                    
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-3 border border-blue-100">
                        <p className="text-sm font-semibold text-gray-900 mb-2">📸 How it works:</p>
                        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                          <li>Take clear photos of each menu page (A4 size recommended)</li>
                          <li>Upload to Imgur, Google Drive, or any image host</li>
                          <li>Add each page as a menu item with the image URL</li>
                          <li>Name each item like "Page 1 - Appetizers", "Page 2 - Main Courses"</li>
                        </ol>
                      </div>
                      
                      <div className="bg-white rounded-lg p-3 border border-blue-100">
                        <p className="text-sm font-semibold text-gray-900 mb-2">✨ Tips:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Use landscape orientation for better mobile viewing</li>
                          <li>• Ensure text is clearly readable in photos</li>
                          <li>• Keep file sizes under 2MB for fast loading</li>
                          <li>• No need to manually enter items - your menu image has everything!</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <button
              onClick={() => setStep(1)}
              className="w-full py-3 bg-primary-blue rounded-lg hover:bg-blue-600"
            >
              Continue to Restaurant Info
            </button>
          </div>
        )}

        {/* Step 1: Restaurant Info */}
        {step === 1 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold">Restaurant Information</h2>
            
            <div>
              <label className="block text-sm mb-2">Restaurant Name *</label>
              <input
                type="text"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 rounded-lg"
                placeholder="My Restaurant"
              />
            </div>

            <div>
              <ImageUrlInput
                value={logoUrl}
                onChange={setLogoUrl}
                label="Restaurant Logo URL (Optional)"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Theme Color</label>
              <div className="flex gap-3 mb-3">
                {THEME_PRESETS.map(preset => (
                  <button
                    key={preset.color}
                    onClick={() => setThemeColor(preset.color)}
                    className="w-12 h-12 rounded-lg border-2 transition-all"
                    style={{ 
                      backgroundColor: preset.color,
                      borderColor: themeColor === preset.color ? 'white' : 'transparent'
                    }}
                    title={preset.name}
                  />
                ))}
              </div>
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="w-full h-12 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 rounded-lg"
              >
                <option value="MVR">MVR (Maldivian Rufiyaa)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(0)}
                className="px-6 py-3 bg-gray-800 rounded-lg hover:bg-gray-700"
              >
                Back
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!restaurantName}
                className="flex-1 py-3 bg-primary-blue rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Menu Editor
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Menu Editor */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">Build Your Menu</h2>
              <button
                onClick={addSection}
                className="px-4 py-2 bg-primary-green rounded-lg hover:bg-green-600"
              >
                + Add Section
              </button>
            </div>

            {sections.length === 0 && (
              <div className="text-center py-12 bg-gray-800 rounded-lg">
                <p className="text-gray-400 mb-4">No sections yet. Click "Add Section" to start building your menu.</p>
              </div>
            )}

            {sections.map(section => (
              <div key={section.id} className="bg-gray-800 rounded-lg p-6">
                <div className="flex gap-4 mb-4">
                  <input
                    type="text"
                    value={section.name}
                    onChange={(e) => updateSection(section.id, e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-700 rounded-lg"
                  />
                  <button
                    onClick={() => addItem(section.id)}
                    className="px-4 py-2 bg-primary-blue rounded-lg hover:bg-blue-600"
                  >
                    + Add Item
                  </button>
                  <button
                    onClick={() => deleteSection(section.id)}
                    className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>

                <div className="space-y-3">
                  {section.items.map(item => (
                    <div key={item.id} className="bg-gray-700 rounded-lg p-4 space-y-4">
                      <div className="grid md:grid-cols-4 gap-3">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(section.id, item.id, { name: e.target.value })}
                          className="px-3 py-2 bg-gray-600 rounded"
                          placeholder="Item name"
                        />
                        <input
                          type="text"
                          value={item.description || ''}
                          onChange={(e) => updateItem(section.id, item.id, { description: e.target.value })}
                          className="px-3 py-2 bg-gray-600 rounded"
                          placeholder="Description"
                        />
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateItem(section.id, item.id, { price: Number(e.target.value) })}
                          className="px-3 py-2 bg-gray-600 rounded"
                          placeholder="Price"
                        />
                        <button
                          onClick={() => deleteItem(section.id, item.id)}
                          className="px-3 py-2 bg-red-500 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                      
                      {/* Image URL Input */}
                      <ImageUrlInput
                        value={item.imageUrl || ''}
                        onChange={(url) => updateItem(section.id, item.id, { imageUrl: url })}
                        label="Item Image URL (Optional)"
                        placeholder="https://your-image-host.com/food-image.jpg"
                      />
                      
                      {/* Tags */}
                      <div className="flex gap-2">
                        {(['veg', 'non_veg', 'spicy', 'new'] as const).map(tag => (
                          <button
                            key={tag}
                            onClick={() => {
                              const tags = item.tags.includes(tag)
                                ? item.tags.filter(t => t !== tag)
                                : [...item.tags, tag];
                              updateItem(section.id, item.id, { tags });
                            }}
                            className={`px-3 py-1 text-xs rounded ${
                              item.tags.includes(tag) ? 'bg-primary-green' : 'bg-gray-600'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 bg-gray-800 rounded-lg hover:bg-gray-700"
              >
                Back
              </button>
              <button
                onClick={handlePublish}
                disabled={loading || sections.length === 0}
                className="flex-1 py-3 bg-primary-green rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? 'Publishing...' : menuId ? 'Update Menu' : 'Publish Menu'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
