'use client';

import { useState, useEffect } from 'react';

interface UserPreferences {
    enableScreenpops: boolean;
    minPhoneNumberLength: number;
}

export default function UserPreferencesComponent() {
    const [enableScreenpops, setEnableScreenpops] = useState<boolean>(false);
    const [minPhoneNumberLength, setMinPhoneNumberLength] = useState<number>(10);
    const [isSaved, setIsSaved] = useState<boolean>(false);

    // Load preferences from localStorage on mount
    useEffect(() => {
        const savedPreferences = localStorage.getItem('userPreferences');
        if (savedPreferences) {
            try {
                const prefs: UserPreferences = JSON.parse(savedPreferences);
                setEnableScreenpops(prefs.enableScreenpops);
                setMinPhoneNumberLength(prefs.minPhoneNumberLength);
            } catch (error) {
                console.error('Error loading preferences:', error);
            }
        }
    }, []);

    const savePreferences = () => {
        const preferences: UserPreferences = {
            enableScreenpops,
            minPhoneNumberLength
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
                            Enable Screenpops
                        </label>
                    </div>
                    <p className="mt-2 text-xs text-gray-600 ml-8">
                        When enabled, incoming calls will automatically trigger screen pops with caller information
                    </p>
                </div>

                {/* Minimum Phone Number Length Setting */}
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

                {/* Current Settings Display */}
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <h3 className="font-semibold text-sm mb-2">Current Settings:</h3>
                    <div className="text-xs space-y-1">
                        <div>
                            <strong>Screenpops:</strong> {enableScreenpops ? 'Enabled' : 'Disabled'}
                        </div>
                        <div>
                            <strong>Min Phone Length:</strong> {minPhoneNumberLength} digits
                        </div>
                    </div>
                </div>

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
                    <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
                        <strong>Success!</strong> Your preferences have been saved locally.
                    </div>
                )}

                {/* Info Note */}
                <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-xs">
                    <strong>Note:</strong> Preferences are saved in your browser's local storage and will persist across sessions.
                </div>
            </div>
        </div>
    );
}