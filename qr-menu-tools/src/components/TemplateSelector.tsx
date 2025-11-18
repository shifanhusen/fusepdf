import { MenuTemplate } from '../types/menu';

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
    preview: '🎨',
    features: ['Serif fonts', 'Centered layout', 'Perfect for fine dining'],
  },
  {
    id: 'modern-grid',
    name: 'Modern Grid',
    description: 'Card-based layout with images in a responsive grid',
    preview: '📱',
    features: ['Photo emphasis', 'Grid layout', 'Modern & colorful'],
  },
  {
    id: 'classic-list',
    name: 'Classic List',
    description: 'Traditional menu format with clear sections',
    preview: '📋',
    features: ['Traditional style', 'Easy to read', 'Warm colors'],
  },
  {
    id: 'photo-showcase',
    name: 'Photo Showcase',
    description: 'Large images to highlight your best dishes',
    preview: '📸',
    features: ['Full-width photos', 'Dark theme', 'Instagram-ready'],
  },
  {
    id: 'compact-cards',
    name: 'Compact Cards',
    description: 'Space-efficient cards perfect for mobile',
    preview: '💳',
    features: ['Mobile optimized', 'Compact design', 'Quick browsing'],
  },
];

export default function TemplateSelector({ selectedTemplate, onSelect }: TemplateSelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Choose Your Template</h2>
        <p className="text-gray-600 dark:text-gray-400">Select a design that best represents your restaurant's style</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className={`p-6 rounded-xl border-2 transition-all text-left ${
              selectedTemplate === template.id
                ? 'border-blue-500 bg-blue-500/10 dark:bg-blue-500/20'
                : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600'
            }`}
          >
            <div className="text-4xl mb-3">{template.preview}</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{template.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{template.description}</p>
            <ul className="space-y-1">
              {template.features.map((feature, index) => (
                <li key={index} className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                  <span className="text-green-500">✓</span> {feature}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>
    </div>
  );
}
