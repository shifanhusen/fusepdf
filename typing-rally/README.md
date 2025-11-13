# ![TurboType Rally](assets/images/typing-Rally.png) TurboType Rally

A real-time multiplayer typing race game where players compete by typing words as fast as possible. Built with vanilla JavaScript and Firebase Realtime Database.

## 🎮 Game Features

- **Multiplayer Racing**: Up to 4 players can race simultaneously
- **Real-time Synchronization**: All players see each other's progress in real-time
- **Room System**: Create or join rooms with 6-character codes
- **Live Statistics**: WPM (Words Per Minute) calculation and progress tracking
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Theme**: Modern, eye-friendly dark UI

## 🚀 Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing one)
3. Enable **Realtime Database**:
   - Go to Build > Realtime Database
   - Click "Create Database"
   - Start in **test mode** (for development)
   - Choose your database location

4. Get your Firebase config:
   - Go to Project Settings > General
   - Scroll to "Your apps" section
   - Click "Web" icon to add web app
   - Copy the `firebaseConfig` object

5. Update `app.js`:
   - Open `typing-rally/app.js`
   - Replace the `firebaseConfig` object at the top with your credentials

### 2. Firebase Database Rules

For development, use these rules (Database > Rules tab):

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true,
        ".indexOn": ["status", "createdAt"]
      }
    }
  }
}
```

**For production**, use more secure rules:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": "!data.exists() || data.child('hostId').val() === auth.uid || data.child('players').child(auth.uid).exists()",
        "players": {
          "$playerId": {
            ".write": "$playerId === auth.uid || data.parent().parent().child('hostId').val() === auth.uid"
          }
        }
      }
    }
  }
}
```

### 3. Vercel Deployment

Add this to your root `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/typing-rally", "destination": "/typing-rally/index.html" },
    { "source": "/typing-rally/(.*)", "destination": "/typing-rally/$1" }
  ]
}
```

### 4. Test Locally

```bash
# Install a simple HTTP server (if you don't have one)
npm install -g http-server

# Run from your project root
http-server

# Open in browser
# http://localhost:8080/typing-rally/
```

## 📁 Project Structure

```
typing-rally/
├── index.html          # Main HTML with all screens
├── style.css           # All styling and animations
├── app.js              # Game logic and Firebase integration
├── assets/             # Optional assets folder
└── README.md           # This file
```

## 🎯 How to Play

### Creating a Race

1. Enter your name
2. Click "Create Room"
3. Share the 6-character room code with friends
4. Wait for at least 2 players to join
5. Click "Start Race" to begin

### Joining a Race

1. Enter your name
2. Get a room code from a friend
3. Enter the room code and click "Join Room"
4. Wait for the host to start the race

### Racing

1. A 3-2-1 countdown will start
2. Type the word shown on screen
3. Press **Enter** or **Space** to submit
4. Your car moves forward with each correct word
5. First to 100% wins!

## 🔧 Configuration

### Adjusting Game Settings

Edit these values in `app.js`:

```javascript
// Maximum players per room
const MAX_PLAYERS = 4;

// Player colors
const PLAYER_COLORS = ['#ff4757', '#2ed573', '#ffa502', '#1e90ff'];

// Race timeout (milliseconds)
const RACE_TIMEOUT = 90000; // 90 seconds

// Words to complete for 100% progress
const WORDS_TO_FINISH = 100;
```

### Adding More Words

Expand the `WORDS` array in `app.js`:

```javascript
const WORDS = [
    'your', 'custom', 'word', 'list',
    // Add more words here...
];
```

## 🎨 Customization

### Colors

Edit CSS variables in `style.css`:

```css
:root {
    --primary-color: #2563eb;
    --secondary-color: #8b5cf6;
    --danger-color: #ef4444;
    /* ... more colors */
}
```

### Player Car Icons

Change the car emoji in `updateRaceTrack()` function:

```javascript
// In app.js, updateRaceTrack function
style="background: ${player.color}">
    🚗  <!-- Change this emoji -->
```

## 🐛 Troubleshooting

### "Failed to create room"
- Check Firebase config in `app.js`
- Verify Realtime Database is enabled
- Check database rules allow writes

### "Room not found"
- Room codes are case-sensitive
- Rooms may expire if empty for too long
- Make sure players are in the same Firebase project

### Players not syncing
- Check internet connection
- Verify Firebase Realtime Database URL is correct
- Check browser console for errors

### Typing input not working
- Make sure the input field is focused
- Check if JavaScript errors in console
- Try refreshing the page

## 🔒 Security Notes

- Current setup uses test mode (open to all)
- For production, implement Firebase Authentication
- Add rate limiting to prevent spam
- Clean up old rooms periodically
- Validate all user inputs

## 📱 Browser Compatibility

- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅
- Mobile browsers ✅

## 🚀 Future Enhancements

- [ ] User authentication
- [ ] Leaderboards
- [ ] Multiple difficulty levels (easy/medium/hard words)
- [ ] Custom word lists
- [ ] Power-ups and obstacles
- [ ] Sound effects
- [ ] Replay system
- [ ] Tournament mode
- [ ] Practice mode (single player)
- [ ] Chat system

## 📄 License

This project is open source and available for personal and commercial use.

## 🤝 Contributing

Feel free to fork, modify, and use this project. If you add cool features, consider sharing them!

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Review Firebase documentation
- Check browser console for errors

---

**Live Demo**: https://innovitecho.com/typing-rally/

**Made with ❤️ for InnoviTecho**
