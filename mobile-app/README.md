# Game Mobile App

React Native mobile application with admin panel and pentest tools.

## Features

- ✅ User authentication (JWT)
- ✅ Game play screens
- ✅ Shop & inventory
- ✅ Leaderboards
- ✅ Admin panel (for admin users)
- ✅ Pentest tools (security testing)
- ✅ Tournament system

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on Android
npx expo start --android

# Run on iOS (Mac only)
npx expo start --ios
```

### Build APK (GitHub Actions - FREE)

1. **Push to GitHub**
```bash
git add .
git commit -m "Ready to build"
git push origin main
```

2. **Trigger Build**
   - Go to GitHub → Actions → "Build Android APK"
   - Click "Run workflow"
   - Wait 5-10 minutes

3. **Download APK**
   - Download from Actions → Artifacts
   - Install on Android device

### Build APK (Local)

```bash
# Prebuild Android project
npx expo prebuild --platform android

# Build release APK
cd android
./gradlew assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release-unsigned.apk
```

## Configuration

### API Target

Edit `api/client.js`:

```javascript
// Development (Android emulator)
const DEV_API = 'http://10.0.2.2:5000/api';

// Production (deployed backend)
const PROD_API = 'https://your-api-domain.com/api';
```

### Environment

Create `.env` file:

```
API_URL=https://your-api.com/api
PENTEST_MODE=false
```

## Screens

| Screen | Description |
|--------|-------------|
| LoginScreen | User authentication |
| HomeScreen | Main dashboard |
| GameScreen | Game play |
| ShopScreen | Buy items |
| LeaderboardScreen | Rankings |
| ProfileScreen | User profile |
| AdminDashboardScreen | Admin panel |
| PentestScreen | Security tools |

## API Services

All API calls are in `api/services.js`:

```javascript
import { authService, adminService } from './api/services';

// Login
const user = await authService.login(email, password);

// Get admin stats
const stats = await adminService.getDashboardStats();
```

## Testing

### Run Pentest Tools

1. Open app
2. Navigate to "Pentest" tab
3. Enter target URL
4. Run security tests

### Quick Test

```bash
# Test API connection
npx expo start
curl http://localhost:5000/api/health
```

## Building for Production

### Before Building

1. Update API URL in `api/client.js`
2. Set `__DEV__ = false`
3. Update version in `app.json`
4. Test all features

### Build Commands

```bash
# Using EAS (Expo)
eas build --platform android --profile production

# Using Gradle (Local)
cd android && ./gradlew assembleRelease

# Using GitHub Actions (Recommended)
# Push to GitHub and trigger workflow
```

## Project Structure

```
mobile-app/
├── App.js                  # Entry point
├── api/
│   ├── client.js           # Axios config
│   ├── services.js         # API functions
│   └── pentest-tools.js    # Security tools
├── screens/
│   ├── LoginScreen.js
│   ├── HomeScreen.js
│   ├── AdminDashboardScreen.js
│   └── PentestScreen.js
├── context/
│   └── AuthContext.js      # Auth state
└── assets/                 # Icons, images
```

## Dependencies

```json
{
  "react-native": "0.72.0",
  "expo": "~49.0.0",
  "axios": "^1.4.0",
  "@react-navigation/native": "^6.1.7"
}
```

## Troubleshooting

### Metro bundler issues
```bash
npx expo start --clear
```

### Android build fails
```bash
cd android && ./gradlew clean
```

### Can't connect to backend
- Check `api/client.js` URL
- Ensure backend is running
- Check network/firewall

## License

MIT

## Support

For issues or questions, check:
- GitHub Issues
- Expo documentation
- React Native documentation
