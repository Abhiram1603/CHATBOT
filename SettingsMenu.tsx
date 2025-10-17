

import React from 'react';
import { Personality } from '../../types';
import ToggleSwitch from './ToggleSwitch';
import IconButton from './IconButton';
import { XIcon } from './Icons';

type Theme = 'light' | 'dark';

interface SettingsMenuProps {
  personality: Personality;
  setPersonality: (personality: Personality) => void;
  useGoogleSearch: boolean;
  setUseGoogleSearch: (use: boolean) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  isOpen: boolean;
  onClose: () => void;
  onClearHistory: () => void;
  onLogout: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({
  personality,
  setPersonality,
  useGoogleSearch,
  setUseGoogleSearch,
  theme,
  onThemeChange,
  isOpen,
  onClose,
  onClearHistory,
  onLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/60 z-40 transition-opacity"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
    >
      <div 
        className="fixed right-0 top-0 h-full w-full max-w-sm glassmorphism border-l border-[var(--border-primary)] shadow-2xl p-6 z-50 flex flex-col slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-grow">
            <div className="flex justify-between items-center mb-6">
                <h3 id="settings-title" className="text-xl font-bold text-[var(--text-primary)] font-heading">Settings</h3>
                <IconButton onClick={onClose} aria-label="Close settings">
                    <XIcon />
                </IconButton>
            </div>
            
            <div className="space-y-6">
                 {/* Theme Toggle */}
                 <ToggleSwitch
                    id="theme-toggle"
                    label="Light Mode"
                    description="Switch between light and dark themes."
                    checked={theme === 'light'}
                    onChange={(isChecked) => onThemeChange(isChecked ? 'light' : 'dark')}
                />

                {/* Personality Settings */}
                <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        AI Personality
                    </label>
                    <div className="relative">
                        <select
                            value={personality}
                            onChange={(e) => setPersonality(e.target.value as Personality)}
                            className="w-full appearance-none bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] py-2.5 px-3 rounded-md focus:outline-none focus:border-[var(--accent-cyan)] transition-colors"
                        >
                            {Object.values(Personality).map((p) => (
                            <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--text-secondary)]">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                </div>
                
                {/* Google Search Toggle */}
                <ToggleSwitch
                    id="google-search-toggle"
                    label="Use Web Search"
                    description="Enable real-time web search for up-to-date answers."
                    checked={useGoogleSearch}
                    onChange={setUseGoogleSearch}
                />
                <hr className="border-[var(--border-primary)]"/>
                
                {/* Actions */}
                <div className="space-y-3">
                     <button 
                        onClick={onClearHistory}
                        className="w-full text-left text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-secondary)] hover:brightness-110 font-medium py-2.5 px-4 rounded-md transition-all"
                    >
                        Clear Chat History
                    </button>
                    <button 
                        onClick={onLogout}
                        className="w-full text-left text-sm text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/30 font-medium py-2.5 px-4 rounded-md transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4 font-heading">VSAI</p>
      </div>
    </div>
  );
};

export default SettingsMenu;