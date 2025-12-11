'use client';

import { useState, useEffect } from 'react';
import Application, {IWebexAppsUserState} from '@webex/embedded-app-sdk';
import {IWebexAppsApplication} from "@webex/embedded-app-sdk/dist/module/types/application.interfaces";

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


export default function WebexIntegrationComponent() {
    const [isSDKLoaded, setIsSDKLoaded] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [user, setUser] = useState<IWebexAppsUserState | null>(null);
    const [deviceType, setDeviceType] = useState<string|null>('');
    const [error, setError] = useState<string>('');
    const [app, setApp] = useState<Application | null>(null);

    useEffect(() => {
        // Check if SDK is loaded via CDN
        if (typeof window !== 'undefined' && window.webex) {
            setIsSDKLoaded(true);
        } else {
            setError('Webex SDK not loaded. Include the SDK script in your HTML.');
        }
    }, []);

    const initializeSDK = async () => {
        try {
            setError('');

            if (!window.webex) {
                throw new Error('Webex SDK not available');
            }

            // Initialize with logging configuration
            const config = {
                logs: {
                    logLevel: 0 // 0=INFO, 1=WARN, 2=ERROR, 3=SILENT
                }
            };

            const webexApp:Application = new  Application(config);

            // Wait for SDK to be ready
            await webexApp.onReady();

            setApp(webexApp);
            setIsInitialized(true);

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

    const getCapabilities = () => {
        if (app) {
            console.log('About:', app.about);
            console.log('Capabilities:', app.capabilities);
            alert('Check console for capabilities information');
        }
    };

    const updateLogLevel = (level: number) => {
        if (app) {
            app.log.updateLogLevel(level);
            alert(`Log level updated to ${['INFO', 'WARN', 'ERROR', 'SILENT'][level]}`);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3">
                <h2 className="text-xl font-semibold">Webex EAF SDK 2.x Integration</h2>

                {/* SDK Status */}
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex items-center gap-2">
                        <span className="font-medium">SDK Status:</span>
                        <span className={`px-2 py-1 rounded text-sm ${isSDKLoaded ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {isSDKLoaded ? 'Loaded' : 'Not Loaded'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="font-medium">Initialized:</span>
                        <span className={`px-2 py-1 rounded text-sm ${isInitialized ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {isInitialized ? 'Yes' : 'No'}
                        </span>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {/* Initialize Button */}
                {!isInitialized && (
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                        type="button"
                        onClick={initializeSDK}
                        disabled={!isSDKLoaded}
                    >
                        Initialize Webex SDK
                    </button>
                )}

                {/* User Information */}
                {isInitialized && user && (
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <h3 className="font-semibold text-lg mb-2">User Information</h3>
                        <div className="space-y-1 text-sm">
                            <div><strong>Display Name:</strong> {user.displayName || 'N/A'}</div>
                            <div><strong>Email:</strong> {user.email || 'N/A'}</div>
                            <div><strong>User ID:</strong> {user.id || 'N/A'}</div>
                            <div><strong>Org ID:</strong> {user.orgId || 'N/A'}</div>
                            <div><strong>Device Type:</strong> {deviceType || 'N/A'}</div>
                        </div>
                    </div>
                )}

                {/* SDK Actions */}
                {isInitialized && (
                    <div className="flex flex-col gap-2">
                        <h3 className="font-semibold">SDK Actions</h3>

                        <button
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                            type="button"
                            onClick={getCapabilities}
                        >
                            Get Capabilities (Check Console)
                        </button>

                        <div className="flex gap-2">
                            <button
                                className="flex-1 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm"
                                type="button"
                                onClick={() => updateLogLevel(0)}
                            >
                                Log: INFO
                            </button>
                            <button
                                className="flex-1 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm"
                                type="button"
                                onClick={() => updateLogLevel(1)}
                            >
                                Log: WARN
                            </button>
                            <button
                                className="flex-1 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm"
                                type="button"
                                onClick={() => updateLogLevel(2)}
                            >
                                Log: ERROR
                            </button>
                            <button
                                className="flex-1 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm"
                                type="button"
                                onClick={() => updateLogLevel(3)}
                            >
                                Log: SILENT
                            </button>
                        </div>
                    </div>
                )}

                {/* SDK Information */}
                <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-sm">
                    <strong>Note:</strong> This component requires the Webex EAF SDK 2.x to be loaded via CDN or NPM.
                    Add to your HTML: <code className="bg-white px-1 rounded">&lt;script src=&#34;https://binaries.webex.com/static-content-pipeline/webex-embedded-app-sdk/v2/webex-embedded-app-sdk.js&#34;&gt;&lt;/script&gt;</code>
                </div>

                {/* Rate Limiting Info */}
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs">
                    <strong>Rate Limits:</strong>
                    <ul className="list-disc list-inside mt-1">
                        <li>SDK initialization: 5 requests per 5 minutes</li>
                        <li>Other SDK requests: 20 requests per minute</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
