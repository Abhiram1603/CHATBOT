import React from 'react';
import { User } from '../../types';

interface ExamplePromptsProps {
  onPromptClick: (prompt: string) => void;
  currentUser: User;
}

const prompts = [
    { 
        title: "Imagine a scene", 
        prompt: "Generate an image of a futuristic city at sunset, with flying cars.",
        icon: ()=><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
    },
    { 
        title: "Explain a concept", 
        prompt: "Explain the concept of quantum computing in simple terms.",
        icon: ()=><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
    },
    { 
        title: "Write a script", 
        prompt: "Write a Python script to scrape headlines from a news website.",
        icon: ()=><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
    },
    { 
        title: "Plan a trip", 
        prompt: "Plan a 3-day itinerary for a trip to Tokyo, Japan.",
        icon: ()=><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
    },
    { 
        title: "Find the latest news", 
        prompt: "What are the top 5 largest economies in the world right now?",
        icon: ()=><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
    },
    { 
        title: "Get creative", 
        prompt: "Write a short story about a friendly robot who discovers music.",
        icon: ()=><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
    },
    { 
        title: "Be a chef", 
        prompt: "Create a recipe for a delicious and healthy vegan chocolate cake.",
        icon: ()=><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="2" x2="8" y2="5"></line><line x1="16" y1="2" x2="16" y2="5"></line><line x1="12" y1="15" x2="12" y2="22"></line><path d="M7 15h10v-3a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v3"></path><path d="M7 8V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3"></path></svg>
    },
    { 
        title: "Debug some code", 
        prompt: "Debug this javascript code snippet: `for(var i=0; i<5; i++){ setTimeout(()=>console.log(i), 1000) }`",
        icon: ()=><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v2"></path><path d="M2 8h20"></path><path d="M10 12h4"></path><path d="M12 16v-4"></path><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path><path d="M18 22h2a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-2"></path></svg>
    },
];


const ExamplePrompts: React.FC<ExamplePromptsProps> = ({ onPromptClick, currentUser }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8 overflow-y-auto fade-in">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2 font-heading">Hello, {currentUser.name || 'there'}!</h1>
            <h2 className="text-2xl font-semibold text-[var(--text-secondary)]">How can I help you today?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl">
            {prompts.map((item, index) => (
                <div 
                    key={index}
                    className="group relative p-0.5 rounded-lg bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-magenta)] hover:brightness-110 transition-all duration-300"
                    >
                    <button
                        onClick={() => onPromptClick(item.prompt)}
                        className="w-full h-full bg-[var(--bg-secondary)] p-4 rounded-md text-left transition-all duration-200"
                        aria-label={`Prompt suggestion: ${item.title}`}
                    >
                        <div className="flex items-center space-x-3 mb-2 text-[var(--accent-cyan)]">
                            <item.icon />
                            <p className="font-semibold text-[var(--text-primary)]">{item.title}</p>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-3">{item.prompt}</p>
                    </button>
                    <div className="absolute -inset-1 bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-magenta)] rounded-lg opacity-0 group-hover:opacity-75 transition duration-500 blur-xl pointer-events-none"></div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default ExamplePrompts;