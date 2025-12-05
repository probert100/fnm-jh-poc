'use client';

import { useState } from 'react';
import * as he from 'he';

export default function CRMCustDspComponent() {
  const [aba, setAba] = useState('');
  const [cust, setCust] = useState('');
  const [instance, setInstance] = useState('');
  const [link, setLink] = useState('');
  const [displayLink, setDisplayLink] = useState('');

  const xmlns = 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://jackhenry.com/jxchange/JES/2008"';

  const finalAba = (aba && aba.length === 9) ? aba : '011001276';
  const msg =
    `<CRMCustDsp ${xmlns}>` +
    `<XPMsgRqHdr><XPHdr><InstRtId>${finalAba}</InstRtId>` +
    `</XPHdr></XPMsgRqHdr><CustId>${cust}</CustId>` +
    `</CRMCustDsp>`;

  const href = `jhaXp:Instance=${instance}&Msg=${msg}`;

  const encodedForDisplay = he.encode(href, { strict: true });

  const createHyperlink = () => {
    setLink(href);
    setDisplayLink(encodedForDisplay);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">CRM Customer Display</h2>
        <input
          type="text"
          placeholder="ABA (9 digits)"
          value={aba}
          onChange={(e) => setAba(e.target.value)}
          maxLength={9}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
        <input
          type="text"
          placeholder="Customer ID"
          value={cust}
          onChange={(e) => setCust(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
        <input
          type="text"
          placeholder="Instance"
          value={instance}
          onChange={(e) => setInstance(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed m-4"
          type="button"
          onClick={createHyperlink}
          disabled={!aba || !cust || !instance}
        >
          Create Test Hyperlink
        </button>
      </div>
      <div className="mt-4">
        <div className="flex">
          <a id="link" className="text-blue-600 underline" href={link || '#'}>Click to Test Generated Link</a>
        </div>

        <h3 className="pt-4"> Link details:</h3>
        <div className="text-center p-6 mt-4 bg-gray-50 rounded-lg">
          <div id="string-link" className="text-sm text-gray-700 break-all font-mono">{link}</div>
        </div>

        <h3 className="pt-4"> Encoded Display of the link:</h3>
        <div className="text-center p-6 mt-4 bg-gray-50 rounded-lg">
          <div id="string-link" className="text-sm text-gray-700 break-all font-mono">{displayLink}</div>
        </div>
      </div>
    </div>
  );
}
