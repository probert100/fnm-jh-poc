'use client';

import { useState } from 'react';
import * as he from 'he';

export default function CRMCustDspComponent() {
  const [aba, setAba] = useState('');
  const [cust, setCust] = useState('');
  const [instance, setInstance] = useState('');

  const xmlns = 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://jackhenry.com/jxchange/JES/2008"';

  const createHyperlink = () => {
    if (aba?.length > 0 && cust?.length > 0 && instance?.length > 0) {
      // Override the global default setting:
      he.encode.options.useNamedReferences = true;

      let instanceString = '';
      let abaString = '';
      let custString = '';

      if (instance && instance.length > 0) {
        instanceString = 'jhaXp:Instance=' +
          instance +
          '&Msg=<CRMCustDsp ' +
          xmlns + '>' +
          '<XPMsgRqHdr><XPHdr>';
      }

      const finalAba = (aba && aba.length === 9) ? aba : '011001276';
      abaString = '<InstRtId>' + finalAba + '</InstRtId>' +
        '</XPHdr></XPMsgRqHdr>';

      if (cust && cust.length > 0) {
        custString = '<CustId>' + cust +
          '</CustId></CRMCustDsp>&amp;';
      }

      const link: string = he.encode(instanceString + abaString + custString,
        {
          strict: true,
        },
      );

      console.log(link);

      const linkElement = document.getElementById('crm-link');
      const stringLinkElement = document.getElementById('crm-string-link');

      if (linkElement) {
        linkElement.setAttribute('href', link);
      }
      if (stringLinkElement) {
        stringLinkElement.innerHTML = link;
      }
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">CRM Customer Display</h2>

      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="ABA (9 digits)"
          value={aba}
          onChange={(e) => setAba(e.target.value)}
          maxLength={9}
          className="px-3 py-2 border border-gray-300 rounded"
        />
        <input
          type="text"
          placeholder="Customer ID"
          value={cust}
          onChange={(e) => setCust(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded"
        />
        <input
          type="text"
          placeholder="Instance"
          value={instance}
          onChange={(e) => setInstance(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded"
        />
        <button
          onClick={createHyperlink}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Hyperlink
        </button>
      </div>

      <div className="mt-4">
        <a id="crm-link" href="#" className="text-blue-600 underline">Click to Test Generated Link</a>
        <div id="crm-string-link" className="mt-2 p-2 bg-gray-100 rounded text-sm break-all"></div>
      </div>
    </div>
  );
}
