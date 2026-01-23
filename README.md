# Webex + Jack Henry Screen Pop Integration

Automatically trigger screen pops in Jack Henry Xperience when calls are received in Webex.

## Overview

This integration connects Webex desktop calling with Jack Henry Xperience banking software. When a call is received in Webex, the caller's phone number is used to automatically open the relevant customer record in Jack Henry via the `jhaXp:` custom protocol.

**Live App:** [https://fnm-jh-ivi.web.app/fnm](https://fnm-jh-ivi.web.app/fnm)

## Architecture

```
┌─────────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│   Webex Desktop Client  │     │  Firebase Realtime  │     │    Helper App       │
│                         │     │      Database       │     │    (Electron)       │
│  ┌───────────────────┐  │     │                     │     │                     │
│  │  Embedded Web App │──┼────>│   /screenPops/      │────>│  Subscribe & Launch │
│  │  (Next.js)        │  │     │     {user}/{msgId}  │     │                     │
│  └───────────────────┘  │     │                     │     └──────────┬──────────┘
└─────────────────────────┘     └─────────────────────┘                │
                                                                       ▼
                                                         ┌─────────────────────────┐
                                                         │   Jack Henry Xperience  │
                                                         │   (jhaXp: protocol)     │
                                                         └─────────────────────────┘
```

**Why this architecture?** Direct communication between the Webex embedded app and the desktop helper app is not possible due to Webex security restrictions. Firebase Realtime Database serves as a secure message hub. See [ARCHITECTURE.md](documentation/ARCHITECTURE.md) for details on failed approaches and why Firebase is required.

## Components

| Component | Location | Description |
|-----------|----------|-------------|
| Web App | `app/` | Next.js app embedded in Webex sidebar |
| API Route | `app/api/data/` | Writes screen pop events to Firebase |
| Helper App | `helper-app/` | Electron app that launches Jack Henry |
| Firebase Config | `lib/firebase-admin.ts` | Firebase Admin SDK initialization |

## Prerequisites

- Node.js 18+
- Firebase project with Realtime Database enabled
- Webex developer account with Embedded App configured
- Jack Henry Xperience installed on user desktops

## Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd fnm-jh-poc
npm install
```

### 2. Configure Environment Variables

Create `.env.local` for local development:

```env
# Firebase Admin SDK (for API routes)
FB_ADMIN_PROJECT_ID=your-project-id
FB_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FB_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FB_ADMIN_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
```

### 3. Configure Webex Embedded App

Add these trusted domains in your Webex Developer Portal:
- `fnm-jh-ivi.web.app`
- `fnm-jh-ivi.firebaseapp.com`
- `fnm-jh-ivi-default-rtdb.firebaseio.com`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000/fnm](http://localhost:3000/fnm) to view the app.

## Deployment

### Web App (Firebase Hosting)

The web app deploys automatically via GitHub Actions on push to `main`:

- `.github/workflows/firebase-hosting-merge.yml` - Production deploy
- `.github/workflows/firebase-hosting-pull-request.yml` - Preview deploys

**Required GitHub Secrets:**
- `FIREBASE_SERVICE_ACCOUNT_FNM_JH_IVI` - Service account JSON
- `FB_ADMIN_PROJECT_ID`
- `FB_ADMIN_CLIENT_EMAIL`
- `FB_ADMIN_PRIVATE_KEY`
- `FB_ADMIN_DATABASE_URL`

### Helper App (Electron)

Build the Electron helper app for distribution:

```bash
cd helper-app
npm install
npm run build
```

## Configuration Options

Users can configure the following in the embedded app:

| Setting | Description | Default |
|---------|-------------|---------|
| Enable Screen Pops | Toggle automatic screen pops | Off |
| Min Phone Length | Minimum digits required to trigger | 10 |
| Instance Name | Jack Henry instance identifier | 6944Production |
| Routing Number | Bank routing number for JH | (configured per bank) |

## Data Flow

1. **Incoming Call** - Webex SDK fires `sidebar:callStateChanged` event
2. **Event Capture** - Embedded app extracts caller ID when call state is `CONNECTED`
3. **URI Generation** - App creates `jhaXp:` URI with caller phone number
4. **Firebase Write** - App POSTs to `/api/data` which writes to Firebase
5. **Real-time Sync** - Firebase notifies subscribed helper app instantly
6. **App Launch** - Helper calls `shell.openExternal(uri)` to open Jack Henry
7. **Cleanup** - Helper marks event as processed

## Project Structure

```
├── app/
│   ├── fnm/
│   │   └── page.tsx                      # Main embedded app page
│   ├── api/
│   │   └── data/
│   │       └── route.ts                  # Firebase write endpoint
│   └── components/
│       ├── WebexScreenPop.tsx            # Webex SDK integration
│       ├── UserPreferencesComponent.tsx  # Settings UI
│       ├── InfoBanner.tsx                # Header banner
│       ├── CustSrchComponent.tsx         # Customer search by name
│       ├── CustSrchByPhoneComponent.tsx  # Customer search by phone
│       └── CRMCustDspComponent.tsx       # CRM customer display
├── lib/
│   └── firebase-admin.ts                 # Firebase Admin SDK setup
├── helper-app/
│   └── src/
│       └── main.ts                       # Electron main process
└── documentation/
    ├── ARCHITECTURE.md                   # Detailed architecture docs
    └── diagrams/                         # Architecture diagrams
```

## Technical Details

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS
- **Webex Integration:** Webex Embedded App SDK
- **Backend:** Firebase Realtime Database
- **Desktop:** Electron helper app
- **Protocol:** Custom `jhaXp:` protocol handler for Jack Henry

### Jack Henry URI Format

Messages follow Jack Henry's JXchange format:
```
jhaXp:Instance={instanceName}&Msg={xmlPayload}
```

XML payload structure:
```xml
<StartCallLink>
  <XPMsgRqHdr>
    <XPHdr>
      <ConsumerProd>Xperience</ConsumerProd>
      <AuditUsrId>XperienceClientAgent</AuditUsrId>
      <InstRtId>{routingNumber}</InstRtId>
    </XPHdr>
  </XPMsgRqHdr>
  <PhoneNum>{phoneNumber}</PhoneNum>
  <Identifier>{routingNumber}</Identifier>
</StartCallLink>
```

## Limitations

- **Helper App Required** - Users must have the Electron helper app running
- **Network Dependency** - Requires internet for Firebase communication
- **Latency** - ~100-500ms delay due to cloud round-trip
- **Single User** - Helper app subscribes to one Firebase user path

## Troubleshooting

**Screen pops not working:**
1. Verify helper app is running
2. Check Firebase connection in helper app logs
3. Expand "Call Events" in embedded app to see event log
4. Verify phone number meets minimum length requirement

**Firebase permission errors:**
- Ensure service account has Realtime Database read/write access
- Check Firebase security rules allow authenticated access

## Based On

Jack Henry Xperience integration tutorials:
- [SilverLake Customer Search Hyperlink Tutorial](https://jackhenry.dev/xperience/tutorials/sl-cust-srch-hyperlink/)
- [CRM Customer Display Hyperlink Tutorial](https://jackhenry.dev/xperience/tutorials/crm-cust-dsp-hyperlink/)

## License

Proprietary - Intelligent Visibility

---

*Created by Intelligent Visibility - January 2026*