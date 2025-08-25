# Unified Wishlist

A cross-platform wishlist app built with **React Native (Expo, TypeScript)** for the frontend and **Node.js + Express (TypeScript)** for the backend. The app allows users to preview URLs, add them to a wishlist, and persist wishlist data across app restarts.

---

## Table of Contents

- [Setup & Run Instructions](#setup--run-instructions)
- [Engineering Tradeoffs & Risks](#engineering-tradeoffs--risks)
- [AI Usage Disclosure](#ai-usage-disclosure)

---

## Setup & Run Instructions

### Backend

1. Navigate to the server directory:

```bash
cd unified-wishlist/server
```

2. Install dependencies:

```bash
cd unified-wishlist/server
```

3. Create .env if needed (optional):

```bash
PORT=3000
```

4. Run the server:

```bash
npm run dev
```

5. Run tests:

```bash
npm run test
```

### Frontend (Standard)

1. Navigate to the app directory:

```bash
cd unified-wishlist/app
```

2. Install dependencies:

```bash
cd unified-wishlist/server
```

3. Create .env:

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

4. Typecheck:

```bash
npm run typecheck
```

5. Start expo:

```bash
npm run start
```

### Frontend (Alternative: Development Build for Testing Deep Links)

```bash
# Prebuild the project (generates native code)
npm run prebuild

# Run on iOS simulator
npm run ios

# Run on Android emulator (if needed)
npm run android
```

<ul>
  <li>
    Notes:
    <ul>
  <li>Prebuild is required only once or when native config changes.</li>
   <li>This creates a local development build where deep links (centscape://add?url=...) work like in production.</li>
   <li>For normal fast-refresh testing, continue using npm run start.</li>
</ul>
  </li>
</ul>

### Engineering Tradeoffs & Risks

<ol>
  <li>
    Unified Wishlist Item
    <ul>
      <li>Single schema for both preview and wishlist reduces complexity but requires defaults for missing fields (e.g., image placeholder, 'N/A' price).</li>
    </ul>
  </li>
  <li>
    Timeouts and Redirects
    <ul>
      <li>Enforced 5s timeout and max 3 redirects to avoid slow or malicious servers.</li>
    </ul>
  </li>
  <li>
    SSRF Protection
    <ul>
      <li>Blocking private/loopback IPs prevents server-side request forgery attacks.</li>
      <li>Tradeoff: Some valid internal resources cannot be fetched.</li>
    </ul>
  </li>
  <li>
    Rate Limiting
    <ul>
      <li>10 requests/min/IP to prevent abuse</li>
      <li>Tradeoff: Could throttle legitimate users during testing.</li>
    </ul>
  </li>
  </li>
    <li>
    Frontend URL Handling
    <ul>
      <li>Deep linking (centscape://add?url=...) pre-fills the Add flow.</li>
      <li>Tradeoff: Ensures consistent user experience but relies on Expo Linking module.</li>
    </ul>
  </li>
  </li>
    <li>
    Schema Validation
    <ul>
      <li>JSON Schema backend request/response correctness.</li>
      <li>Tradeoff: Slight overhead on request processing.</li>
    </ul>
  </li>
</ol>

### AI Usage Disclosure

<ul>
  <li>
    Prompts Used:
    <ul>
        <li>Generated React Native components with tab navigation.</li>
        <li>Designed backend Express routes with SSRF, timeout, redirect, and size caps.</li>
        <li>Created JSON Schemas for request/response.</li>
        <li>Wrote Jest test cases for endpoint validation.</li>
    </ul>
  </li>
  <li>
    Reason:
    <ul>
      <li>Used AI for boilerplate generation, validation logic, test scaffolding, and schema design.</li>
      <li>All logic and security constraints verified manually.</li>
    </ul>
  </li>
</ul>
