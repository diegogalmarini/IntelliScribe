import React from 'react';
import { UserProfile } from '../../../types';

interface ProfileAvatarProps {
    user: UserProfile;
    onClick: () => void;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ user, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Perfil y Configuración"
        >
            {user.avatarUrl ? (
                <img
                    src={user.avatarUrl}
                    alt={user.firstName}
                    className="w-8 h-8 rounded-full"
                />
            ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                    {user.firstName?.charAt(0) || 'U'}
                </div>
            )}
        </button>
    );
};
