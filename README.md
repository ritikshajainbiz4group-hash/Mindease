# MindEase 🧠

A calm, minimal AI mental health mobile application built with React Native and Expo.

## Tech Stack

- **React Native** with **Expo** (~50.0.6)
- **TypeScript** — strict mode
- **React Navigation** v6 — native stack
- **Zustand** v4 — lightweight state management

## Project Structure

```
MindEase/
├── App.tsx                        # Entry point
├── app.json                       # Expo config
├── babel.config.js
├── package.json
├── tsconfig.json
└── src/
    ├── components/                # Reusable UI components
    │   ├── InputField.tsx         # Controlled text input with label, error, secure toggle
    │   ├── PrimaryButton.tsx      # Multi-variant button (primary, secondary, outline, ghost)
    │   ├── ScreenContainer.tsx    # Safe area + keyboard avoiding wrapper
    │   └── index.ts               # Barrel export
    ├── navigation/
    │   └── AuthStack.tsx          # Auth flow navigator (Login → Signup)
    ├── screens/
    │   └── Auth/
    │       ├── LoginScreen.tsx    # Email/password + Google Sign-In UI
    │       └── SignupScreen.tsx   # Name/email/password/confirm UI
    ├── store/
    │   └── authStore.ts           # Zustand auth state (stubbed, ready for Firebase)
    └── theme/
        └── index.ts               # colors, typography, spacing, borderRadius, shadows
```

## Getting Started

```bash
# Install dependencies
npm install

# Start the Expo dev server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## Theme Colors

| Token        | Value     | Usage                      |
|--------------|-----------|----------------------------|
| `primary`    | `#6C8EBF` | Buttons, links, accents    |
| `background` | `#F0F4FF` | Screen backgrounds         |
| `text`       | `#2D3748` | Primary text               |
| `accent`     | `#8FB8AD` | Secondary accents, hints   |

## Next Steps

- Integrate Firebase Authentication (email/password + Google)
- Add `AppNavigator` that switches between `AuthStack` and `AppStack` based on auth state
- Build the main app screens (Dashboard, Chat, Journal, Profile)
