import { useState } from 'react';
import { MenuTemplate } from '../types/menu';

// Import template preview images
import elegantMinimalSvg from '../assets/elegant-minimal.svg?url';
import modernGridSvg from '../assets/modern-grid.svg?url';
import classicListSvg from '../assets/classic-list.svg?url';
import photoShowcaseSvg from '../assets/photo-showcase.svg?url';
import compactCardsSvg from '../assets/compact-cards.svg?url';

interface TemplateSelectorProps {
  selectedTemplate: MenuTemplate;
  onSelect: (template: MenuTemplate) => void;
}

const templates: Array<{
  id: MenuTemplate;
  name: string;
  description: string;
  preview: string;
  features: string[];
}> = [
  {
    id: 'elegant-minimal',
    name: 'Elegant Minimal',
    description: 'Clean, sophisticated design with plenty of white space',
    preview: elegantMinimalSvg,
    features: ['Serif fonts', 'Centered layout', 'Perfect for fine dining'],
  },
  {
    id: 'modern-grid',
    name: 'Modern Grid',
    description: 'Card-based layout with images in a responsive grid',
    preview: modernGridSvg,
    features: ['Photo emphasis', 'Grid layout', 'Modern & colorful'],
  },
  {
    id: 'classic-list',
    name: 'Classic List',
    description: 'Traditional menu format with clear sections',
    preview: classicListSvg,
    features: ['Traditional style', 'Easy to read', 'Warm colors'],
  },
  {
    id: 'photo-showcase',
    name: 'Photo Showcase',
    description: 'Large images to highlight your best dishes',
    preview: photoShowcaseSvg,
    features: ['Full-width photos', 'Dark theme', 'Instagram-ready'],
  },
  {
    id: 'compact-cards',
    name: 'Compact Cards',
    description: 'Space-efficient cards perfect for mobile',
    preview: compactCardsSvg,
    features: ['Mobile optimized', 'Compact design', 'Quick browsing'],
  },
];

export default function TemplateSelector({ selectedTemplate, onSelect }: TemplateSelectorProps) {
  const [previewTemplate, setPreviewTemplate] = useState<MenuTemplate | null>(null);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">Choose Your Template</h2>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
          Select a design that best represents your restaurant's style. Each template is fully responsive and optimized for mobile viewing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className={`group relative overflow-hidden rounded-xl sm:rounded-2xl border-2 sm:border-3 transition-all duration-300 hover:shadow-xl sm:hover:scale-[1.02] ${
              selectedTemplate === template.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600'
            }`}
          >
            {/* Large Preview Image */}
            <div className="aspect-[4/3] bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
              <img 
                src={template.preview} 
                alt={`${template.name} template preview`}
                className="w-full h-full object-contain p-2 sm:p-4 transition-transform duration-300 group-hover:scale-110"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewTemplate(template.id);
                  }}
                  className="text-blue-600 dark:text-blue-400 font-semibold text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 bg-white/95 dark:bg-gray-800/95 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors border border-blue-200 dark:border-blue-700"
                >
                  <span className="hidden sm:inline">🔍 Preview Large</span>
                  <span className="sm:hidden">🔍 Preview</span>
                </button>
              </div>
              {/* Selected indicator */}
              {selectedTemplate === template.id && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            {/* Template Details */}
            <div className="p-4 sm:p-6 text-left">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {template.name}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 leading-relaxed">{template.description}</p>
              
              {/* Features */}
              <div className="space-y-2">
                <div className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Features:</div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {template.features.map((feature, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                    >
                      <span className="text-green-500 text-xs">✓</span>
                      <span className="truncate max-w-[120px] sm:max-w-none">{feature}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4" onClick={() => setPreviewTemplate(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                {templates.find(t => t.id === previewTemplate)?.name} Preview
              </h3>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg sm:rounded-xl p-4 sm:p-8">
              <img 
                src={templates.find(t => t.id === previewTemplate)?.preview || ''}
                alt={`${templates.find(t => t.id === previewTemplate)?.name} large preview`}
                className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
              />
            </div>
            
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
              <button
                onClick={() => {
                  if (previewTemplate) {
                    onSelect(previewTemplate);
                    setPreviewTemplate(null);
                  }
                }}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors text-sm sm:text-base"
              >
                Select This Template
              </button>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors text-sm sm:text-base"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
