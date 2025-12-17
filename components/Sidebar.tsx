
import React, { useState } from 'react';
import { AppRoute, UserProfile, Folder } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  activeFolderId: string;
  onSelectFolder: (folderId: string) => void;
  folders: Folder[];
  onAddFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
  onDeleteFolder: (id: string) => void;
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  activeFolderId,
  onSelectFolder,
  folders,
  onAddFolder,
  onDeleteFolder,
  user,
  isOpen,
  onClose
}) => {
  const { t } = useLanguage();
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleDashboardClick = () => {
    onSelectFolder('ALL'); // Reset filter
    onNavigate(AppRoute.DASHBOARD);
  };

  const submitNewFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onAddFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreatingFolder(false);
    }
  };

  // Usage Calculation
  const usagePercent = user.subscription.minutesLimit > 0
    ? Math.min((user.subscription.minutesUsed / user.subscription.minutesLimit) * 100, 100)
    : 0;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-background-dark border-r border-slate-200 dark:border-border-dark flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-border-dark/50">
          <div className="flex items-center gap-2 text-primary cursor-pointer" onClick={() => { handleDashboardClick(); onClose(); }}>
            <span className="material-symbols-outlined text-3xl">graphic_eq</span>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Diktalo</span>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-600">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-6">
          <nav className="space-y-1">
            <button
              onClick={handleDashboardClick}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors group ${currentRoute === AppRoute.DASHBOARD && activeFolderId === 'ALL'
                  ? 'bg-primary/10 text-primary dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
            >
              <span className={`material-symbols-outlined ${currentRoute === AppRoute.DASHBOARD && activeFolderId === 'ALL' ? 'material-symbols-filled' : ''}`}>
                dashboard
              </span>
              {t('dashboard')}
            </button>

            <button
              onClick={() => onNavigate(AppRoute.INTEGRATIONS)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors group ${currentRoute === AppRoute.INTEGRATIONS
                  ? 'bg-primary/10 text-primary dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
            >
              <span className={`material-symbols-outlined ${currentRoute === AppRoute.INTEGRATIONS ? 'material-symbols-filled' : ''}`}>
                extension
              </span>
              {t('integrations')}
            </button>

            <button
              onClick={() => onNavigate(AppRoute.SUBSCRIPTION)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors group ${currentRoute === AppRoute.SUBSCRIPTION
                  ? 'bg-primary/10 text-primary dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
            >
              <span className={`material-symbols-outlined ${currentRoute === AppRoute.SUBSCRIPTION ? 'material-symbols-filled' : ''}`}>
                workspace_premium
              </span>
              {t('plans')}
            </button>

            <button
              onClick={() => onNavigate(AppRoute.SETTINGS)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors group ${currentRoute === AppRoute.SETTINGS
                  ? 'bg-primary/10 text-primary dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
            >
              <span className={`material-symbols-outlined ${currentRoute === AppRoute.SETTINGS ? 'material-symbols-filled' : ''}`}>
                settings
              </span>
              {t('settings')}
            </button>
          </nav>

          {/* Folders */}
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('folders')}</p>
              <button
                onClick={() => setIsCreatingFolder(true)}
                className="text-slate-400 hover:text-primary transition-colors"
                title={t('newFolder')}
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>

            <nav className="space-y-1">
              {folders.map(folder => (
                <div key={folder.id} className="group relative flex items-center">
                  <button
                    onClick={() => onSelectFolder(folder.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeFolderId === folder.id && currentRoute === AppRoute.DASHBOARD
                        ? 'bg-primary/10 text-primary dark:text-blue-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}>
                    <span className={`material-symbols-outlined text-[20px] ${activeFolderId === folder.id ? 'text-primary' : 'text-slate-400 group-hover:text-primary'}`}>{folder.icon}</span>
                    <span className="truncate flex-1 text-left">{folder.name}</span>
                  </button>

                  {folder.type === 'user' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); }}
                      className="absolute right-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  )}
                </div>
              ))}
            </nav>

            {/* New Folder Input */}
            {isCreatingFolder && (
              <form onSubmit={submitNewFolder} className="mt-2 px-3 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-border-dark rounded-lg px-2 py-1">
                  <span className="material-symbols-outlined text-slate-400 text-[18px]">folder</span>
                  <input
                    autoFocus
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder={t('folderNamePlaceholder')}
                    className="bg-transparent border-none focus:ring-0 text-sm w-full p-0 text-slate-900 dark:text-white placeholder-slate-400"
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setIsCreatingFolder(false);
                    }}
                  />
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingFolder(false)}
                    className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={!newFolderName.trim()}
                    className="text-xs bg-primary text-white px-2 py-0.5 rounded disabled:opacity-50"
                  >
                    {t('create')}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Help Link (Added) */}
          <div className="mt-auto px-3 mb-2">
            <button
              onClick={() => onNavigate(AppRoute.MANUAL)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors group ${currentRoute === AppRoute.MANUAL
                  ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
            >
              <span className={`material-symbols-outlined ${currentRoute === AppRoute.MANUAL ? 'material-symbols-filled' : ''}`}>
                help
              </span>
              {t('help')}
            </button>
          </div>

          {/* Usage Stats (Freemium Feature) */}
          {user.subscription.planId === 'free' && (
            <div className="mx-3 mt-2 mb-4 bg-slate-100 dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('usage')}</span>
                <span className="text-xs font-mono text-slate-900 dark:text-white">{user.subscription.minutesUsed}/{user.subscription.minutesLimit}m</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mb-3">
                <div className={`h-1.5 rounded-full transition-all ${usagePercent > 90 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${usagePercent}%` }}></div>
              </div>
              <button
                onClick={() => onNavigate(AppRoute.SUBSCRIPTION)} // Changed to Subscription route
                className="w-full py-1.5 bg-gradient-to-r from-primary to-purple-600 text-white text-xs font-bold rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all">
                {t('upgrade')} ⚡
              </button>
            </div>
          )}
        </div>

        {/* User */}
        <div className="border-t border-slate-200 dark:border-border-dark p-4">
          <button
            onClick={() => onNavigate(AppRoute.SETTINGS)}
            className="flex items-center gap-3 w-full hover:bg-slate-100 dark:hover:bg-white/5 p-2 rounded-lg transition-colors">
            <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20 overflow-hidden">
              {user.avatarUrl ? (
                <img
                  key={user.avatarUrl} // Key forces re-render if URL changes
                  src={user.avatarUrl}
                  alt="User"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{user.firstName[0]}{user.lastName[0]}</span>
              )}
            </div>
            <div className="flex-1 text-left overflow-hidden">
              <p className="text-sm font-medium truncate text-slate-900 dark:text-white">{user.firstName} {user.lastName}</p>
              <div className="flex items-center gap-1.5">
                <span className={`size-1.5 rounded-full ${user.subscription.planId === 'pro' ? 'bg-brand-violet' : user.subscription.planId === 'business' ? 'bg-brand-blue' : user.subscription.planId === 'business_plus' ? 'bg-brand-green' : 'bg-brand-grey'}`}></span>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate uppercase">{user.subscription.planId === 'pro' ? 'Pro' : user.subscription.planId === 'business' ? 'Biz' : user.subscription.planId === 'business_plus' ? 'Biz+' : t('freePlan')}</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400">more_vert</span>
          </button>
        </div>
      </aside>
      );
};
