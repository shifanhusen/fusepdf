# QR Menu Studio

A modern, responsive QR menu creator for restaurants. Create beautiful digital menus with QR codes in minutes - no login required!

## Features

- 🎨 **Beautiful Templates**: Choose from simple list, card list, or photo card layouts
- 🎨 **Custom Theming**: Pick your brand colors with preset themes
- 📱 **Mobile-First**: Optimized for customer viewing on mobile devices
- 🌙 **Dark Mode**: Automatic theme switching for better readability
- 💾 **Local Storage**: Your work is automatically saved as you edit
- 📥 **QR Code Downloads**: Export QR codes as PNG or SVG
- 🔄 **Live Preview**: See changes in real-time as you build your menu

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **React Router** for navigation
- **qrcode-generator** for QR code generation

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
qr-menu-tools/
├── src/
│   ├── components/
│   │   └── QrPreview.tsx       # QR code component
│   ├── data/
│   │   └── menuApi.ts          # LocalStorage API (Firestore-ready)
│   ├── pages/
│   │   ├── Creator.tsx         # Menu creation wizard
│   │   └── CustomerView.tsx    # Public menu view
│   ├── types/
│   │   └── menu.ts             # TypeScript interfaces
│   ├── App.tsx                 # Main app with routing
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind configuration
└── package.json
```

## Configuration

The app is configured to:
- Build to `../public/qr-menu/` directory
- Use `/qr-menu/` as the base path
- Support dark mode by default

## Routes

- `/` - Landing page and menu creator
- `/m/:menuId` - Customer view (public menu)
- `/edit/:menuId` - Edit view (with edit key support)

## Data Model

The app uses TypeScript interfaces for type safety:

- `MenuItem` - Individual menu items with name, price, tags, etc.
- `MenuSection` - Groups of items (e.g., "Appetizers", "Main Course")
- `MenuDoc` - Complete menu with restaurant info and settings

## LocalStorage API

Currently uses localStorage for data persistence. The API is structured to easily migrate to Firestore:

- `createMenu()` - Create a new menu
- `updateMenu()` - Update an existing menu
- `getMenu()` - Fetch a menu by ID
- Auto-save functionality for draft menus

## Future Enhancements

- [ ] Firestore integration for cloud storage
- [ ] Multi-language support
- [ ] Menu analytics
- [ ] Print-friendly menu layouts
- [ ] Bulk item import (CSV/Excel)
- [ ] Advanced customization options

## License

MIT
