import React from 'react';
import { GroundingChunk } from '../../types';

interface SourceCitationProps {
  citations: GroundingChunk[];
}

const SourceCitation: React.FC<SourceCitationProps> = ({ citations }) => {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-4 border-t border-gray-600/50 pt-3">
      <h4 className="text-xs font-semibold text-gray-400 mb-2">Sources:</h4>
      <div className="flex flex-wrap gap-2">
        {citations.map((citation, index) => (
          // FIX: Added a check to ensure citation.web and citation.web.uri exist before rendering the link.
          citation.web && citation.web.uri && (
            <a
              key={index}
              href={citation.web.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-gray-800 text-cyan-300 hover:bg-gray-900 hover:text-cyan-200 px-2 py-1 rounded-full transition-colors duration-200 truncate max-w-xs flex items-center gap-1.5"
              title={citation.web.title}
            >
              <span className="flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-gray-600 text-white rounded-full">{index + 1}</span>
              {citation.web.title || new URL(citation.web.uri).hostname}
            </a>
          )
        ))}
      </div>
    </div>
  );
};

export default SourceCitation;