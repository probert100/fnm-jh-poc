'use client';

import { useState } from 'react';

export default function AboutComponent() {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const toggleDialog = () => {
        setIsOpen(!isOpen);
    };

    const closeDialog = () => {
        setIsOpen(false);
    };

    return (
        <>
            {/* About Icon Button */}
            <button
                onClick={toggleDialog}
                className="fixed bottom-4 right-4 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50"
                aria-label="About"
                title="About"
            >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            </button>

            {/* Dialog/Modal Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={closeDialog}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={closeDialog}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Close"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>

                        {/* Dialog Content */}
                        <div className="space-y-4">
                            {/* Title */}
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-900">About</h2>
                                <div className="mt-2 h-1 w-16 bg-blue-600 mx-auto rounded"></div>
                            </div>

                            {/* Version */}
                            <div className="text-center">
                                <p className="text-sm text-gray-600">Software Version</p>
                                <p className="text-xl font-semibold text-gray-900">0.0.2a</p>
                            </div>

                            {/* Developer Info */}
                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600">Developed by</p>
                                    <p className="font-semibold text-gray-900">Intelligent Visibility</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600">Website</p>
                                    <a
                                        href="https://www.intelligentvisibility.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                    >
                                        www.intelligentvisibility.com
                                    </a>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600">Author</p>
                                    <p className="font-medium text-gray-900">Robert Misior</p>
                                    <a
                                        href="mailto:rmisior@intelligentvisibility.com"
                                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                                    >
                                        rmisior@intelligentvisibility.com
                                    </a>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600">Release Date</p>
                                    <p className="font-medium text-gray-900">December 2025</p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="text-center pt-4">
                                <button
                                    onClick={closeDialog}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}