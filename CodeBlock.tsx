import React, { useState } from 'react';

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

interface CodeBlockProps {
    code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="bg-gray-900/70 rounded-lg my-2 overflow-hidden border border-gray-700/50">
            <div className="flex justify-between items-center px-4 py-2 bg-gray-800/30">
                <span className="text-xs font-semibold text-gray-400">Python</span>
                <button
                    onClick={handleCopy}
                    className="flex items-center text-xs text-gray-400 hover:text-white transition-colors"
                >
                    {isCopied ? (
                        <>
                            <CheckIcon />
                            <span className="ml-1.5">Copied!</span>
                        </>
                    ) : (
                        <>
                            <CopyIcon />
                            <span className="ml-1.5">Copy code</span>
                        </>
                    )}
                </button>
            </div>
            <pre className="p-4 text-sm text-gray-200 overflow-x-auto">
                <code className="font-mono">{code}</code>
            </pre>
        </div>
    );
};

export default CodeBlock;