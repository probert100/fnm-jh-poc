# Jack Henry Browser Integration - Proof of Concept

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This is a proof of concept demonstrating browser integration with Jack Henry's SilverLake system. Built with Next.js and React, this application generates custom protocol hyperlinks (`jhaXp:`) that can launch Jack Henry applications with pre-populated data.

**[View Live Demo](https://fnm-jh-poc.vercel.app/)**

## Overview

This POC is part of the learning process for software development with Jack Henry's system. The current focus is learning how to generate specially formatted hyperlinks that, when clicked, trigger the Jack Henry client software with specific transaction data, streamlining workflows between web and desktop environments.

## Based On

This project is a React implementation based on the official Jack Henry Xperience tutorials:
- [SilverLake Customer Search Hyperlink Tutorial](https://jackhenry.dev/xperience/tutorials/sl-cust-srch-hyperlink/)
- [CRM Customer Display Hyperlink Tutorial](https://jackhenry.dev/xperience/tutorials/crm-cust-dsp-hyperlink/)

The components shown in this project are React versions of the examples demonstrated in these tutorials.

## Features

### Customer Search by Name Component
Generate hyperlinks to search for customers in SilverLake by first name.

**Required Fields:**
- First Name
- Instance
- Inst Rt Id

### Customer Search by Phone Component
Generate hyperlinks to search for customers in SilverLake by phone number. Phone numbers are automatically sanitized to contain only digits.

**Required Fields:**
- Phone Number (automatically strips non-digit characters)
- Instance
- Inst Rt Id

### CRM Customer Display Component
Generate hyperlinks to display specific customer records in the CRM system.

**Required Fields:**
- ABA (9-digit routing number)
- Customer ID
- Instance

## Technical Details

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS
- **Encoding:** HTML entity encoding using the `he` library
- **Protocol:** Custom `jhaXp:` protocol handler for Jack Henry integration

### How It Works

1. User fills in required fields in the web form
2. Application constructs an XML message containing transaction data
3. Message is encoded and wrapped in a `jhaXp:` protocol URL
4. Clicking the generated link launches the Jack Henry client with the data

### XML Message Format

Messages follow Jack Henry's JXchange format:
```xml
<CustSrch xmlns:xsi="..." xmlns:xsd="..." xmlns="...">
  <XPMsgRqHdr>
    <XPHdr>
      <InstRtId>011001276</InstRtId>
    </XPHdr>
  </XPMsgRqHdr>
  <FirstName>John</FirstName>
</CustSrch>
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
npm install
```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Dependencies

Key dependencies:
- `he` - HTML entity encoding/decoding
- `next` - React framework
- `react` - UI library
- `tailwindcss` - Styling

## Project Structure

```
app/
├── components/
│   ├── CustSrchComponent.tsx           # Customer search by name form
│   ├── CustSrchByPhoneComponent.tsx    # Customer search by phone form
│   ├── CRMCustDspComponent.tsx         # CRM customer display form
│   └── InfoBanner.tsx                  # Informational banner
├── page.tsx                             # Main page
└── layout.tsx                           # Root layout
```

## Components

### CustSrchComponent
Generates customer search hyperlinks for SilverLake based on customer first name.

### CustSrchByPhoneComponent
Generates customer search hyperlinks for SilverLake based on phone number. Automatically sanitizes phone input to include only digits in the generated link.

### CRMCustDspComponent
Generates CRM customer display hyperlinks.



## Future Enhancements

- Additional Jack Henry transaction types
- Form validation and error handling
- Hyperlink history/favorites
- Batch link generation
- Configuration management for instances and routing numbers

## Notes

- This is a proof of concept for demonstration purposes
- Requires Jack Henry client software to be installed and configured
- The `jhaXp:` protocol must be registered with the operating system

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Jack Henry Integration Guide](https://www.jackhenry.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
