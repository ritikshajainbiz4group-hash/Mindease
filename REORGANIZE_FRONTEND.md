# Frontend Reorganization Guide

The React Native code needs to be moved into the `frontend/` folder to fix the Expo build error.

## Manual Steps (Close VS Code first to unlock files)

1. **Close VS Code completely**

2. **Open File Explorer** and navigate to `E:\MindEase`

3. **Move these folders/files from root to `frontend/`:**
   - `src/` → `frontend/src/`
   - `.expo/` → `frontend/.expo/`
   - `node_modules/` → `frontend/node_modules/`
   - `.env.development` → `frontend/.env.development`

4. **Files already moved:**
   - ✅ `package.json`
   - ✅ `package-lock.json`
   - ✅ `tsconfig.json`
   - ✅ `app.json`
   - ✅ `App.tsx`
   - ✅ `babel.config.js`
   - ✅ `__tests__/`
   - ✅ `assets/`

5. **Create `frontend/.env`** with:
   ```
   API_BASE_URL=http://192.168.125.192:8000
   ```

6. **After moving, your structure should be:**
   ```
   E:\MindEase\
   ├── backend/          (Python/FastAPI)
   ├── frontend/         (React Native/Expo)
   │   ├── src/
   │   ├── node_modules/
   │   ├── package.json
   │   ├── App.tsx
   │   ├── .env
   │   └── ...
   ├── react_native_rules.md
   ├── fastapi_rules.md
   └── README.md
   ```

7. **Then run:**
   ```bash
   cd E:\MindEase\frontend
   npm install
   npx expo start
   ```

## Alternative: Use Git to reorganize

If manual move is tedious:

```bash
cd E:\MindEase
git mv src frontend/src
git mv .expo frontend/.expo
git mv node_modules frontend/node_modules
git mv .env.development frontend/.env.development
```

Then create `frontend/.env` and run `npm install` from the `frontend/` folder.
