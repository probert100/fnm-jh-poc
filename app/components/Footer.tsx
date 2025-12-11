'use client';

export default function Footer() {
    return (
        <footer className="w-full bg-gray-800 text-gray-300 py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Company Info */}
                    <div className="space-y-2">
                        <h3 className="text-white font-semibold text-lg">Intelligent Visibility</h3>
                        <p className="text-sm">
                            Developed by{' '}
                            <a
                                href="https://www.intelligentvisibility.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 hover:underline"
                            >
                                Intelligent Visibility
                            </a>
                        </p>
                        <p className="text-sm">Version 0.0.2a</p>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2">
                        <h3 className="text-white font-semibold text-lg">Contact</h3>
                        <div className="text-sm space-y-1">
                            <p>Robert Misior</p>
                            <a
                                href="mailto:rmisior@intelligentvisibility.com"
                                className="text-blue-400 hover:text-blue-300 hover:underline block"
                            >
                                rmisior@intelligentvisibility.com
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="space-y-2">
                        <h3 className="text-white font-semibold text-lg">Links</h3>
                        <div className="text-sm space-y-1">
                            <a
                                href="https://www.intelligentvisibility.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 hover:underline block"
                            >
                                www.intelligentvisibility.com
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-8 pt-6 border-t border-gray-700 text-center text-sm">
                    <p>
                        &copy; December 2025 Intelligent Visibility
                    </p>
                </div>
            </div>
        </footer>
    );
}
