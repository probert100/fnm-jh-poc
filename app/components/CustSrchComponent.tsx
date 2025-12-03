'use client';

import { useState } from 'react';
import * as he from 'he';

export default function CustSrchComponent() {
    const [firstName, setFirstName] = useState('');
    const [instance, setInstance] = useState('');
    const [instRtId, setInstRtId] = useState('');

    const xmlns = 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://jackhenry.com/jxchange/JES/2008"';

    const createHyperlink = () => {
        if (firstName && firstName.length > 0) {
            // Override the global default setting:
            he.encode.options.useNamedReferences = true;

            const instanceName = instance && instance.length > 0 ? 'Instance=' + instance : '';
            const finalInstRtId = (instRtId && instRtId.length > 0) ? instRtId : '011001276';

            const link: string = he.encode(
                'jhaXp:' +
                instanceName +
                '&Msg=<CustSrch ' +
                xmlns + '>' +
                '<XPMsgRqHdr><XPHdr><InstRtId>' +
                finalInstRtId +
                '</InstRtId></XPHdr></XPMsgRqHdr><FirstName>' +
                firstName +
                '</FirstName></CustSrch>',
                {
                    strict: true,
                },
            );

            console.log(link);

            const linkElement = document.getElementById('link');
            const stringLinkElement = document.getElementById('string-link');

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
            <div className="flex flex-col gap-3">
                <h2 className="text-xl font-semibold">Customer search in SilverLake</h2>
                <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                <input
                    type="text"
                    placeholder="Instance"
                    value={instance}
                    onChange={(e) => setInstance(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                <input
                    type="text"
                    placeholder="Inst Rt Id"
                    value={instRtId}
                    onChange={(e) => setInstRtId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed m-4"
                    type="button"
                    onClick={createHyperlink}
                    disabled={!firstName || !instance || !instRtId}
                >
                    Create Test Hyperlink
                </button>
            </div>
            <div className="mt-4">
                <a className="text-blue-600 underline" id="link" href="#">Click to Test Generated Link</a>
                <div className="text-center p-6 mt-4 bg-gray-50 rounded-lg">
                    <div id="string-link" className="text-sm text-gray-700 break-all font-mono"></div>
                </div>
            </div>

        </div>
    );
}
