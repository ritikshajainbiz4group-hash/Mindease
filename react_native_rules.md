
## REACT NATIVE

### Structure & Naming
React Native CLI

├── __tests__/              # Test files
│   ├── __mocks__/          # Mock files for testing
│   ├── components/         # Component tests
│   ├── screens/           # Screen tests
│   ├── services/          # Service tests
│   └── utils/             # Utility tests
├── android/               # Android-specific files
├── ios/                   # iOS-specific files
├── src/                   # Main source code
│   ├── assets/            # Images, fonts, icons
│   ├── components/        # Reusable UI components
│   ├── config/            # Configuration files
│   ├── constants/         # App constants
│   ├── hooks/             # Custom React hooks
│   ├── locales/           # Internationalization files
│   ├── navigation/        # Navigation configuration
│   ├── screens/           # Screen components
│   ├── services/          # API and external services
│   ├── store/             # Redux store and slices
│   ├── styles/            # Global styles and themes
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── validations/       # Form validation schemas
├── .env.development       # Development environment variables
├── App.tsx                # Root component
├── README.md              # Project documentation
└── tsconfig.json          # TypeScript configuration.

### Styling
⚠️ Avoid inline styles; use StyleSheet.create or styled-components.  
Use Platform-centric styles when needed (Platform.OS === "ios" | "android").

```javascript
const styles = StyleSheet.create({
  container: { padding: 16 },
});
```

### Components & Layout
Functional components only; keep reusable tiny components.  
Use SafeAreaView (iOS safe zones) and KeyboardAvoidingView when inputs are used.  
Centralize common header/buttons in shared components.

### Lists & Performance
⚠️ Use FlatList/SectionList/VirtualizedList for large datasets.  
Memoize with React.memo, useMemo, useCallback.  
Avoid heavy work on UI thread; offload to background/native modules.

### Navigation & State
Keep stack navigation simple; avoid deep nesting.  
Avoid overusing navigation params; use state management (Redux/Context) for shared data.

### Misc & Tooling
Remove logs before release; lock dependencies to exact versions.  
Prefer React Native CLI over Expo for flexibility (unless project standard dictates Expo).

### Secure Storage for Sensitive Data
Never store sensitive data (e.g., JWTs, API keys, credentials) in AsyncStorage.
Use secure storage solutions such as react-native-keychain or expo-secure-store for handling secrets.
### Lazy Loading
Use conditional imports for heavy libraries (e.g., video players, image pickers).
Split screens/features into separate bundles where possible.
Load modules only when required (e.g., after navigation).
Example:
        if (enableVideo) {
          const VideoPlayer = require('react-native-video').default;
        }
