# Kabayo IPTV

<div align="center">

**Stalker Portal IPTV Manager for LG WebOS TV**

[![LG WebOS](https://img.shields.io/badge/LG-WebOS%20TV-blue.svg)](https://www.lg.com/us/webos-tv)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)

</div>

## 📺 Features

### ✅ Stalker Portal Management
- **Multiple Portals**: Store and switch between multiple Stalker Portal accounts
- **MAC Address Configuration**: Use any valid MAC address (XX:XX:XX:XX:XX:XX)
- **Easy Editing**: Add, edit, or delete portal configurations anytime
- **Active Portal**: Quick switch between your different portal accounts

### 🎬 IPTV Streaming
- **Real Stalker Portal Integration**: Authenticates with MAC address (not M3U)
- **HLS Stream Support**: Plays HLS (.m3u8) streams directly in browser
- **Channel Browser**: Search and filter channels by name or category
- **Video Player**: Full controls with play/pause, volume, fullscreen

### 🖥️ TV Optimized
- **LG WebOS Native**: Optimized for LG WebOS TV browser
- **Remote Control**: Full remote control navigation (arrows, OK, back)
- **Large Interface**: Big fonts and buttons for 10-foot viewing
- **Dark Mode**: Easy on the eyes for extended viewing sessions
- **4K Support**: Optimized for 4K TVs

## 🚀 Getting Started

### Prerequisites

- A Stalker Portal provider (NOT M3U playlist)
- Valid MAC address from your IPTV provider
- LG WebOS TV (3.0+) or device with web browser

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/kabayo-iptv.git
cd kabayo-iptv
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

4. **Build for production**
```bash
npm run build
```

## 📱 LG WebOS TV Setup

### Step 1: Open Web Browser
1. Press the **Home** button on your LG TV remote
2. Navigate to the **Web Browser** app
3. Open the browser app

### Step 2: Enter App URL
1. Navigate to your deployed app URL
2. Or use the LG TV Content Store if published
3. Bookmark for quick access

### Step 3: Remote Control Navigation
- **Arrow Keys**: Navigate through menu items
- **Enter/OK**: Select focused item
- **Back**: Go to previous screen
- **Exit**: Close the app

## 🔧 Configuration

### Adding Your Stalker Portal

1. Click **"Add Portal"** button
2. Fill in the information:
   - **Portal Name**: Give it a name (e.g., "My Provider")
   - **MAC Address**: Your assigned MAC (format: `00:1A:79:XX:XX:XX`)
   - **Host URL**: Your provider's portal URL (e.g., `http://my-portal.com`)
   - **Portal URL**: Optional subpath (e.g., `/portal.php`)
   - **Notes**: Any extra info (provider, subscription, etc.)

### Activating & Watching

1. Click the **checkmark** button on your portal to activate it
2. The app will authenticate with your MAC address
3. Your channel list will load automatically
4. Select a channel to start watching

## ⚠️ Important Notes

### Stalker Portal vs M3U

**This is NOT an M3U playlist app.** Stalker Portal is completely different:

| Stalker Portal (This App) | M3U Playlist (Different) |
|---|---|
| Uses MAC address for authentication | Uses username/password |
| Connects to middleware server | Loads playlist file |
| Real-time channel updates | Static playlist |
| Provider controls content | You control content |

**Your provider must support Stalker Portal middleware.**

### MAC Address Information

Your IPTV provider usually assigns you a MAC address. Common formats:
- `00:1A:79:XX:XX:XX` (MAG format)
- `00:1A:79:XX:XX:XX` (Generic)

## 🛠️ Tech Stack

- **Platform**: Kliv web application
- **Framework**: React 18.3 + TypeScript 5.5
- **Build Tool**: Vite 5.4
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Radix UI + shadcn/ui
- **Video**: HLS.js for stream playback
- **Database**: SQLite with Row-Level Security
- **State Management**: TanStack React Query

## 📺 Supported Devices

✅ **LG WebOS TV (3.0+)**: Fully optimized with remote control support  
✅ **Samsung Tizen**: Should work  
✅ **Chromecast with TV**: Via Chrome browser  
✅ **Phone/Tablet**: Any modern mobile browser  
✅ **Desktop**: Chrome, Firefox, Safari, Edge  

## 🐛 Troubleshooting

### "Connection Failed"
- Check your MAC address format (XX:XX:XX:XX:XX:XX)
- Verify the host URL is correct
- Make sure your subscription is active
- Check if the portal is accessible (try in phone browser)

### "Stream Error"
- Some channels may be offline
- Your subscription might not include this channel
- Internet connection issues

### No Channels Loading
- Verify portal supports Stalker middleware
- Check MAC is authorized on provider side
- Try a different portal URL if available

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions:
1. Check your provider supports Stalker Portal
2. Verify MAC address and URL are correct
3. Test portal URL in a regular browser first
4. Check your subscription is active

---

<div align="center">

**Kabayo IPTV** • Made for LG WebOS TV

Built with ❤️ using Kliv

</div>
