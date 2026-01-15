'use client';

import { useState, useEffect } from 'react';
import WebexScreenPop from "@/app/components/WebexScreenPop";

interface UserPreferences {
    enableScreenpops: boolean;
    minPhoneNumberLength: number;
    instanceName: string;
    routingNumber: string; // could be a number? but looks like it can start with 0
}

const DEFAULT_PREFERENCES: UserPreferences = {
    enableScreenpops: false,
    minPhoneNumberLength: 10,
    instanceName: "6944Production",
    routingNumber: "053103640"
};

function loadPreferences(): UserPreferences | null {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('userPreferences');
    if (!saved) return null;
    try {
        return JSON.parse(saved) as UserPreferences;
    } catch {
        console.error('Error loading preferences from localStorage');
        return null;
    }
}

export default function UserPreferencesComponent() {
    // Initialize with defaults to avoid hydration mismatch
    const [enableScreenpops, setEnableScreenpops] = useState<boolean>(DEFAULT_PREFERENCES.enableScreenpops);
    const [minPhoneNumberLength, setMinPhoneNumberLength] = useState<number>(DEFAULT_PREFERENCES.minPhoneNumberLength);
    const [instanceName, setInstanceName] = useState<string>(DEFAULT_PREFERENCES.instanceName);
    const [routingNumber, setRoutingNumber] = useState<string>(DEFAULT_PREFERENCES.routingNumber);
    const [isHydrated, setIsHydrated] = useState(false);

    // Load preferences from localStorage after hydration
    useEffect(() => {
        const saved = loadPreferences();
        if (saved) {
            setEnableScreenpops(saved.enableScreenpops);
            setMinPhoneNumberLength(saved.minPhoneNumberLength);
            setInstanceName(saved.instanceName);
            setRoutingNumber(saved.routingNumber);
        }
        setIsHydrated(true);
    }, []);

    /*
    Instance Name: 6944Production
Routing Number: 053103640
     */

    const [isSaved, setIsSaved] = useState<boolean>(false);

    const savePreferences = () => {
        const preferences: UserPreferences = {
            enableScreenpops,
            minPhoneNumberLength,
            instanceName,
            routingNumber
        };

        localStorage.setItem('userPreferences', JSON.stringify(preferences));
        setIsSaved(true);

        // Reset saved indicator after 2 seconds
        setTimeout(() => {
            setIsSaved(false);
        }, 2000);
    };

    const resetToDefaults = () => {
        setEnableScreenpops(false);
        setMinPhoneNumberLength(10);
        setIsSaved(false);
    };

    const handlePhoneNumberLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 1 && value <= 20) {
            setMinPhoneNumberLength(value);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3">
                <h2 className="text-xl font-semibold">User Preferences</h2>

                {/* Enable Screenpops Setting */}
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="enableScreenpops"
                            checked={enableScreenpops}
                            onChange={(e) => setEnableScreenpops(e.target.checked)}
                            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                        />
                        <label
                            htmlFor="enableScreenpops"
                            className="text-sm font-medium text-gray-900 cursor-pointer select-none"
                        >
                            Enable Screen Pops
                        </label>
                    </div>
                    <p className="mt-2 text-xs text-gray-600 ml-8">
                        When enabled, incoming calls will automatically trigger screen pops with caller information
                    </p>
                </div>

                {/* Minimum Phone Number Length Setting */
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <label
                        htmlFor="minPhoneLength"
                        className="block text-sm font-medium text-gray-900 mb-2"
                    >
                        Minimum Phone Number Length
                    </label>
                    <input
                        type="number"
                        id="minPhoneLength"
                        min="1"
                        max="20"
                        value={minPhoneNumberLength}
                        onChange={handlePhoneNumberLengthChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                    <p className="mt-2 text-xs text-gray-600">
                        Phone numbers must have at least this many digits to be considered valid (1-20)
                    </p>
                </div>
                }

                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <label
                        htmlFor="routingNumber"
                        className="block text-sm font-medium text-gray-900 mb-2"
                    >
                        Routing Number
                    </label>
                    <input
                        type="text"
                        id="routingNumber"
                        placeholder="053103640"
                        disabled={true}
                        value={routingNumber}
                        onChange={(e) => setRoutingNumber(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                    <p className="mt-2 text-xs text-gray-600">
                        Bank&apos;s Routing Number
                    </p>
                </div>

                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <label
                        htmlFor="instanceName"
                        className="block text-sm font-medium text-gray-900 mb-2"
                    >
                        Instance Name: 6944Production
                    </label>
                    <input
                        type="text"
                        id="instanceName"
                        placeholder="6944Production"
                        disabled={true}
                        value={instanceName}
                        onChange={(e) => setInstanceName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                    <p className="mt-2 text-xs text-gray-600">
                        JackHenry Instance Name
                    </p>
                </div>

                { /*Current Settings Display*/
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700">
                    <h3 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100">Current Settings:</h3>
                    <div className="text-xs space-y-1 text-blue-800 dark:text-blue-200">
                        <div>
                            <strong>Screen Pops:</strong> {enableScreenpops ? 'Enabled' : 'Disabled'}
                        </div>
                        <div>
                            <strong>Min Phone Length:</strong> {minPhoneNumberLength} digits
                        </div>
                        <div>
                            <strong>Routing Number:</strong> {routingNumber}
                        </div>
                        <div>
                            <strong>Instance Name:</strong> {instanceName}
                        </div>
                    </div>
                </div>
                }

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        className="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                        type="button"
                        onClick={savePreferences}
                    >
                        {isSaved ? '✓ Saved!' : 'Save Preferences'}
                    </button>
                    <button
                        className="flex-1 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
                        type="button"
                        onClick={resetToDefaults}
                    >
                        Reset to Defaults
                    </button>
                </div>

                {/* Save Confirmation */}
                {isSaved && (
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-200 text-sm">
                        <strong>Success!</strong> Your preferences have been saved locally.
                    </div>
                )}

                {/* Info Note */}
                <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 text-xs text-yellow-800 dark:text-yellow-200">
                    <strong>Note:</strong> Preferences are saved in your browser&apos;s local storage and will persist across sessions.
                </div>
            </div>

            <WebexScreenPop instance={instanceName} instRtId={routingNumber}  screenPopEnabled={enableScreenpops} minPhoneNumberLength={minPhoneNumberLength} savePreferences={savePreferences}/>
        </div>
    );
}
