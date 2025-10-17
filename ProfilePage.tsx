
import React, { useState, useRef } from 'react';
import { User } from '../../types';
import LanguageSelector from '../ui/LanguageSelector';
import { fileToBase64 } from '../../utils/fileUtils';
import { XIcon, CameraIcon } from '../ui/Icons';
import { getInitials } from '../../utils/stringUtils';
import InputField from '../ui/InputField';


interface ProfilePageProps {
    user: User;
    onClose: () => void;
    onUpdate: (updatedUser: User) => Promise<void>;
    onDelete: () => Promise<void>;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onClose, onUpdate, onDelete }) => {
    const [name, setName] = useState(user.name || '');
    const [phone, setPhone] = useState(user.phone || '');
    const [bio, setBio] = useState(user.bio || '');
    const [language, setLanguage] = useState(user.preferredLanguage || 'en-US');
    const [picture, setPicture] = useState(user.profilePicture || null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const base64 = await fileToBase64(file);
                setPicture(base64);
            } catch (error) {
                console.error("Error converting file:", error);
                alert("Failed to upload image. Please try another file.");
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const updatedUser: User = {
            ...user,
            name,
            phone,
            bio,
            preferredLanguage: language,
            profilePicture: picture || undefined,
        };
        await onUpdate(updatedUser);
        setIsSubmitting(false);
        onClose();
    };
    
    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to permanently delete your account and all associated data? This action cannot be undone.')) {
            setIsSubmitting(true);
            await onDelete();
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 fade-in"
            onClick={onClose}
        >
            <div 
                className="w-full max-w-lg glassmorphism rounded-2xl shadow-2xl p-8 relative flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                    <XIcon />
                </button>

                <h2 className="text-3xl font-bold text-[var(--text-primary)] font-heading text-center mb-6">Edit Profile</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative group">
                            {picture ? (
                                <img src={picture} alt="Profile" className="w-28 h-28 rounded-full object-cover border-2 border-[var(--accent-cyan)]/50" />
                            ) : (
                                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-blue)] flex items-center justify-center font-bold text-white text-4xl shadow-lg">
                                    {getInitials(user.name)}
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 w-full h-full bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                disabled={isSubmitting}
                            >
                                <CameraIcon />
                            </button>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/png, image/jpeg, image/webp"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField id="name" label="Full Name" type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={isSubmitting} />
                        <InputField id="phone" label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isSubmitting} />
                    </div>

                     <InputField id="email" label="Email" type="email" value={user.email} readOnly className="text-gray-400 bg-gray-800/40 cursor-not-allowed" />

                    <InputField id="bio" label="Bio" as="textarea" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us a little about yourself..." disabled={isSubmitting} />

                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Preferred Language</label>
                        <LanguageSelector selectedLanguage={language} onLanguageChange={setLanguage} className="w-full" />
                    </div>
                    
                    <div className="flex justify-between items-center pt-4">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isSubmitting}
                            className="px-4 py-2 font-medium text-sm text-red-500 rounded-md hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] focus:ring-red-500 transition-colors disabled:opacity-50"
                        >
                            Delete Account
                        </button>
                        <button type="submit" disabled={isSubmitting} className="px-6 py-2 font-semibold text-white bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-blue)] rounded-md hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] focus:ring-[var(--accent-cyan)] transition-transform transform hover:scale-105 disabled:opacity-75 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
