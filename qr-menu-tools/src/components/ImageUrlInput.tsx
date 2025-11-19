import { useState } from 'react';

interface ImageUrlInputProps {
  value?: string;
  onChange: (url: string) => void;
  label: string;
  placeholder?: string;
}

export default function ImageUrlInput({ value = '', onChange, label, placeholder = 'https://example.com/image.jpg' }: ImageUrlInputProps) {
  const [showHelp, setShowHelp] = useState(false);

  const hostingOptions = [
    {
      name: 'Imgur',
      url: 'https://imgur.com',
      description: 'Free image hosting - drag & drop, no account needed',
      icon: '🖼️'
    },
    {
      name: 'PostImages',
      url: 'https://postimages.org',
      description: 'Free permanent hosting - simple upload',
      icon: '📷'
    },
    {
      name: 'ImgBB',
      url: 'https://imgbb.com',
      description: 'Free image hosting with API - up to 32MB',
      icon: '🌟'
    },
    {
      name: 'Cloudinary',
      url: 'https://cloudinary.com',
      description: 'Professional CDN with image optimization',
      icon: '☁️'
    },
    {
      name: 'Google Drive',
      url: 'https://drive.google.com',
      description: 'Share image → "Anyone with link can view" → Copy link',
      icon: '📁'
    }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="text-xs text-blue-400 hover:text-blue-300 underline"
        >
          Where to host images?
        </button>
      </div>

      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
      />

      {/* Image Preview */}
      {value && (
        <div className="mt-3">
          <p className="text-sm text-gray-400 mb-2">Preview:</p>
          <div className="w-32 h-24 bg-gray-700 rounded-lg overflow-hidden border border-gray-600 relative">
            <img 
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const errorDiv = target.nextElementSibling as HTMLElement;
                if (errorDiv) errorDiv.classList.remove('hidden');
              }}
              onLoad={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'block';
                const errorDiv = target.nextElementSibling as HTMLElement;
                if (errorDiv) errorDiv.classList.add('hidden');
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs hidden bg-gray-700">
              ❌ Invalid URL
            </div>
          </div>
        </div>
      )}

      {/* Help Panel */}
      {showHelp && (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-200">📸 Image Hosting Options</h4>
            <button
              onClick={() => setShowHelp(false)}
              className="text-gray-500 hover:text-gray-300"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2">
            {hostingOptions.map((option) => (
              <div key={option.name} className="flex items-start gap-3 p-2 bg-gray-700/50 rounded">
                <span className="text-lg">{option.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <a
                      href={option.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline"
                    >
                      {option.name}
                    </a>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{option.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-600">
            <div className="text-xs text-gray-400 space-y-1">
              <p className="font-medium text-gray-300">💡 Tips for best results:</p>
              <ul className="space-y-0.5 ml-2">
                <li>• Use 16:9 or 4:3 aspect ratio images</li>
                <li>• Compress images to under 1MB for faster loading</li>
                <li>• Ensure image URL ends with .jpg, .png, or .webp</li>
                <li>• Test the URL in a browser before using</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}