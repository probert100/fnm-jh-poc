'use client';

import {useCallback, useEffect, useState} from 'react';
import Application, {ICall, IWebexAppsSidebar, IWebexAppsUserState} from '@webex/embedded-app-sdk';
import {IWebexAppsApplication} from "@webex/embedded-app-sdk/dist/module/types/application.interfaces";
import {BADGE_TYPE, CALL_STATE, CALL_TYPE} from "@webex/embedded-app-sdk/dist/module/constants/sidebar";
import * as he from "he";
import axios, {AxiosError} from 'axios';

interface WebexSDKConfig {
    logs?: {
        logLevel?: number;
    };
}



declare global {
    interface Window {
        webex?: {
            Application: new (config?: WebexSDKConfig) => IWebexAppsApplication;
        };
    }
}

type WebexScreenPopProps = {
    instRtId: string;
    instance:string;
    screenPopEnabled: boolean;
    minPhoneNumberLength:number;
    savePreferences?:()=>void

};

export default function WebexScreenPop({instRtId, instance,screenPopEnabled, minPhoneNumberLength, savePreferences }:WebexScreenPopProps) {
    const [isSDKLoaded, setIsSDKLoaded] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [user, setUser] = useState<IWebexAppsUserState | null>(null);
    const [deviceType, setDeviceType] = useState<string|null>('');
    const [error, setError] = useState<string>('');
    const [app, setApp] = useState<Application | null>(null);
    const [sidebar, setSidebar] = useState<IWebexAppsSidebar  | null>(null);
    const [call, setCall] = useState<ICall | null>(null);
    const [callLog, setCallLog] = useState<string[]>([])
    const [currentLink, setCurrentLink] = useState<string>('')
    const [processedCallIds, setProcessedCallIds] = useState<Set<string>>(new Set())

    const addLog = useCallback((message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setCallLog(prev => [...prev, `[${timestamp}] ${message}`]);
    }, [])

    const triggerScreenPop = useCallback((uri: string) => {
        addLog('SystemBrowser openUrlInSystemBrowser started');
        app?.openUrlInSystemBrowser(uri)
            .then(value => {
                addLog('SystemBrowser Res:'+value);
            })
            .catch(error=>{
                addLog('SystemBrowser Error:'+error);
              // console.log("Error: ", window?.webex?.Application?.ErrorCodes[error]);
            })
      //  const link = document.createElement('a');
      //  link.href = uri;
      //  link.style.display = 'none';
      //  document.body.appendChild(link);
      //  link.click();
      //  setTimeout(() => document.body.removeChild(link), 100);
    }, [])

    const  normalizeUsPhoneNumber = (input: string): string => {
        if (!input) return input;

        // Remove all non-digit characters
        const digits = input.replace(/\D/g, '');

        // If number starts with US country code (1) and is 11 digits, strip it
        if (digits.length === 11 && digits.startsWith('1')) {
            return digits.substring(1);
        }

        // If already a 10-digit US number, return as-is
        if (digits.length === 10) {
            return digits;
        }

        // Otherwise return original digits (or throw if you prefer strictness)
        return digits;
    }

    const generateJakHenryURI = useCallback((phoneNumber: string) => {
        const msg =
            `<StartCallLink>` +
            `<XPMsgRqHdr>` +
            `<XPHdr>` +
            `<ConsumerProd>Xperience</ConsumerProd>` +
            `<AuditUsrId>XperienceClientAgent</AuditUsrId>` +
            `<InstRtId>${instRtId}</InstRtId>` +
            `</XPHdr>` +
            `</XPMsgRqHdr>` +
            `<PhoneNum>${phoneNumber.replace(/\D/g, '')}</PhoneNum>` +
            `<Identifier>${instRtId}</Identifier>` +
            `</StartCallLink>`;

        return `jhaXp:Instance=${instance}&Msg=${msg}`;
    }, [instRtId, instance])

    useEffect( () => {
        // Check if SDK is available (this just checks, doesn't initialize)
        const checkSDK = async () => {
            try {
                // Try to import the SDK - if it works, SDK is loaded
                setIsSDKLoaded(true);

                // Auto-initialize on mount
                const config = {
                    logs: {
                        logLevel: 0 // 0=INFO, 1=WARN, 2=ERROR, 3=SILENT
                    }
                };

                const webexApp: Application = new Application(config);
                await webexApp.onReady();

                setApp(webexApp);
                setIsInitialized(true);

                const webexSidebar = await webexApp.context.getSidebar() as IWebexAppsSidebar;
                if (webexSidebar.badge) {
                    setSidebar(webexSidebar)
                   /* const isBadgeSet = await webexSidebar.showBadge({
                        badgeType: BADGE_TYPE.COUNT,
                        count: 100
                    });

                    */
                }

                webexApp.listen()
                        .then(() => {
                            webexApp.on("sidebar:callStateChanged", (call) => {
                                console.log("Call state changed. New call object:", call);
                                setCall(call as ICall)

                            })
                        })
                        .catch((reason: string) => {
                            const errorMessage = Application.ErrorCodes[reason as keyof typeof Application.ErrorCodes] || `Unknown error (${reason})`;
                            alert("listen: fail reason=" + errorMessage);
                        });



                // Get user information (static in 2.x)
                const userData = webexApp.application.states.user;
                setUser(userData);

                // Get device type
                setDeviceType(webexApp.deviceType);

            } catch (err) {
                setError(`Failed to initialize: ${err instanceof Error ? err.message : 'Unknown error'}`);
                console.error('Webex SDK initialization error:', err);
            }
        };
             checkSDK()
    }, []);


    useEffect( () => {
        if(call?.state === CALL_STATE.CONNECTED && call.callType === CALL_TYPE.RECEIVED){
            const remoteCaller = call.remoteParticipants[0]?.callerID;
            const callId = `${remoteCaller}-${call.state}-${call.callType}`;

            addLog(`Call received [${callId}] - remoteCaller: ${remoteCaller}, screenPopEnabled: ${screenPopEnabled}, length: ${remoteCaller?.length}, minLength: ${minPhoneNumberLength}`);

            if(screenPopEnabled && remoteCaller && remoteCaller.length >= minPhoneNumberLength){
               const normalizedNumber = normalizeUsPhoneNumber(remoteCaller);
               const uri = generateJakHenryURI(normalizedNumber);

               setCurrentLink(uri);
               addLog(`Triggering screen pop for: ${normalizedNumber}`);

                addLog('Calling local helper-app');
               // Send to helper-app to trigger screen pop (bypasses browser security)
               axios.post('http://127.0.0.1:8887', { uri, phoneNumber: normalizedNumber })
                   .then(res => addLog(`Helper-app response: ${JSON.stringify(res.data)}`))
                   .catch(err => {
                       const error = err as AxiosError;
                       addLog(`Helper-app error: ${err.message}  ${error.name} ${error.code} `)
                    //   addLog(`Helper-app error json: ${JSON.stringify( error.name)}`)
                   });

                addLog('Calling vercel ');
                axios.post('https://fnm-jh-poc.vercel.app/api/data', { uri, phoneNumber: normalizedNumber })
                    //.then(res => addLog(`vercel response: ${JSON.stringify(res.data)}`))
                    .then(res => addLog(`vercel response success`))
                    .catch(err => addLog(`vercel error: ${err.message}`));
              /*
                app?.openUrlInSystemBrowser(uri)
                    .then(value => {
                        addLog('SystemBrowser Res:'+value);
                    })
                    .catch(error=>{
                        addLog('SystemBrowser Error:'+error);
                        try{
                            // @ts-ignore
                            addLog('SystemBrowser Error details:'+" "+window?.webex?.Application?.ErrorCodes[error]);
                        }catch (e){}
                        //console.log("Error: ", window?.webex?.Application?.ErrorCodes[error]);
                    })
*/
               // Double RAF ensures click happens AFTER React render + browser paint
            /*   requestAnimationFrame(() => {
                   requestAnimationFrame(() => {
                       triggerScreenPop(uri);
                   });
               });*/
            } else {
               addLog(`Screen pop skipped - enabled: ${screenPopEnabled}, hasRemoteCaller: ${!!remoteCaller}`);
            }
        }
    }, [call, screenPopEnabled, minPhoneNumberLength, generateJakHenryURI, addLog, triggerScreenPop]);



    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3">
                <h2 className="text-xl font-semibold">F&M Integration</h2>

                {/* Error Display */}
                {error && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-200">
                        <strong>Error:</strong> {error}
                    </div>
                )}



                {/* SDK Actions */}


                {isInitialized && app && (
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200">
                        <h3 className="font-semibold mb-2">App Info:</h3>
                        <div className="space-y-2 text-sm">

                            <div>
                                <strong>Call State:</strong>
                                <pre className="mt-1 p-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded text-xs overflow-x-auto">
                                    {

                                        JSON.stringify(call, null, 2)
                                    }
                                </pre>
                            </div>
                            <div>
                                Current Link: <a href={currentLink} target="new">{currentLink}</a>
                                <strong>Call Log:</strong>
                                <pre className="mt-1 p-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded text-xs overflow-x-auto">
                                    {

                                        JSON.stringify(callLog, null, 2)
                                    }
                                </pre>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
