
import React, { useState, useEffect, useRef } from 'react';
import { Recording, AppRoute, NoteItem, MediaItem, Folder, UserProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { ThemeToggle } from '../components/ThemeToggle';

interface DashboardProps {
  onNavigate: (route: AppRoute) => void;
  recordings: Recording[];
  onSelectRecording: (id: string) => void;
  onDeleteRecording: (id: string) => void;
  onRenameRecording: (id: string, newTitle: string) => void;
  onMoveRecording: (id: string, folderId: string) => void;
  selectedFolderId: string;
  folders: Folder[];
  onImportRecording?: (url: string, durationSeconds: number, customTitle: string, notes: NoteItem[], media: MediaItem[]) => void;
  user: UserProfile; // Added User prop for greeting
}

export const Dashboard: React.FC<DashboardProps> = ({ 
    onNavigate, 
    recordings, 
    onSelectRecording, 
    onDeleteRecording,
    onRenameRecording,
    onMoveRecording,
    selectedFolderId,
    folders,
    onImportRecording,
    user
}) => {
  const { t } = useLanguage();
  
  // Dropdown Menu State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  // Modal States
  const [viewingRecording, setViewingRecording] = useState<Recording | null>(null);
  const [actionModal, setActionModal] = useState<{ type: 'rename' | 'delete' | 'move', id: string, title?: string } | null>(null);
  const [tempRenameTitle, setTempRenameTitle] = useState('');

  // System Report Modal State
  const [showSystemReport, setShowSystemReport] = useState(false);
  const [systemChecks, setSystemChecks] = useState<{
      api: boolean;
      browser: boolean;
      storage: number; // Percentage estimate
      storageBytes: number;
  }>({ api: false, browser: false, storage: 0, storageBytes: 0 });

  // File Import Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // 1. Filter Recordings based on Folder
  const filteredRecordings = selectedFolderId === 'ALL' 
    ? recordings 
    : recordings.filter(r => r.folderId === selectedFolderId);

  // 2. Calculate Real Metrics
  const totalRecordings = filteredRecordings.length;
  
  const getFolderTitle = () => {
      const folder = folders.find(f => f.id === selectedFolderId);
      if (folder) return folder.name;
      return t('allRecordings');
  };

  const handleActionClick = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setActiveMenuId(activeMenuId === id ? null : id);
  };

  const handleViewContext = (e: React.MouseEvent, recording: Recording) => {
      e.stopPropagation();
      setViewingRecording(recording);
      setActiveMenuId(null);
  };

  // --- File Import Logic ---
  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Use FileReader to get base64 for persistence
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
          const base64Audio = event.target?.result as string;
          
          // Create temp audio to get duration
          const audio = new Audio(base64Audio);
          audio.onloadedmetadata = () => {
              const durationSec = audio.duration;
              // Call parent handler to create the recording
              if (onImportRecording) {
                  onImportRecording(base64Audio, durationSec, file.name.replace(/\.[^/.]+$/, ""), [], []);
              }
          };
      };
      if(fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- System Report Logic ---
  const handleViewReport = () => {
      // 1. Check API Key presence (safe check)
      const hasApiKey = typeof process !== 'undefined' && process.env && !!process.env.API_KEY;
      
      // 2. Check Browser Capabilities
      const hasMediaRecorder = !!(window.MediaRecorder);
      
      // 3. Check Storage Usage (Estimate)
      let _lsTotal = 0, _xLen, _x;
      for (_x in localStorage) {
          if (!localStorage.hasOwnProperty(_x)) {
              continue;
          }
          _xLen = ((localStorage[_x].length + _x.length) * 2);
          _lsTotal += _xLen;
      }
      const totalBytes = _lsTotal;
      // Assume 5MB limit typical for browsers
      const percentage = (totalBytes / 5242880) * 100;

      setSystemChecks({
          api: hasApiKey,
          browser: hasMediaRecorder,
          storage: Math.min(percentage, 100),
          storageBytes: totalBytes
      });
      
      setShowSystemReport(true);
  };

  // --- Modal Handlers ---

  const openDeleteModal = (e: React.MouseEvent, id: string, title: string) => {
      e.stopPropagation();
      setActionModal({ type: 'delete', id, title });
      setActiveMenuId(null);
  };

  const confirmDelete = () => {
      if (actionModal && actionModal.type === 'delete') {
          onDeleteRecording(actionModal.id);
          setActionModal(null);
      }
  };

  const openRenameModal = (e: React.MouseEvent, id: string, currentTitle: string) => {
      e.stopPropagation();
      setTempRenameTitle(currentTitle);
      setActionModal({ type: 'rename', id, title: currentTitle });
      setActiveMenuId(null);
  };

  const openMoveModal = (e: React.MouseEvent, id: string, title: string) => {
      e.stopPropagation();
      setActionModal({ type: 'move', id, title });
      setActiveMenuId(null);
  };

  const confirmRename = () => {
      if (actionModal && actionModal.type === 'rename' && tempRenameTitle.trim()) {
          onRenameRecording(actionModal.id, tempRenameTitle.trim());
          setActionModal(null);
      }
  };

  const confirmMove = (folderId: string) => {
      if (actionModal && actionModal.type === 'move') {
          onMoveRecording(actionModal.id, folderId);
          setActionModal(null);
      }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark overflow-hidden relative h-screen transition-colors duration-200">
      {/* Header */}
      <header className="h-auto flex flex-row items-center justify-between px-4 py-4 md:px-8 md:py-6 border-b border-slate-200 dark:border-border-dark bg-white/50 dark:bg-background-dark/80 backdrop-blur-sm z-10 transition-colors duration-200">
        <div className="flex flex-col">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            {selectedFolderId === 'hr_confidential' && <span className="material-symbols-outlined text-primary">lock</span>}
            {getFolderTitle()}
          </h1>
          {/* Breadcrumb / Status */}
          <div className="flex items-center gap-2 mt-1">
             <div className="size-2 rounded-full bg-green-500 animate-pulse"></div>
             <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('systemStatus')}: <span className="text-green-600 dark:text-green-400">{t('statusOk')}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
                onClick={handleViewReport}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
          >
                <span className="material-symbols-outlined text-sm">health_and_safety</span>
                {t('viewReport')}
          </button>
          <ThemeToggle />
          <LanguageSelector />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth w-full">
        <div className="w-full max-w-[1600px] mx-auto flex flex-col gap-10">
            
            {/* HERO SECTION: Greeting & Quick Actions */}
            <div className="relative overflow-hidden rounded-2xl bg-[#1e2736] border border-border-dark shadow-2xl p-8 md:p-10">
                {/* Gradient Background Effect */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-blue/10 to-transparent pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-t from-brand-violet/10 to-transparent pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                            {t('welcomeUser').replace('{name}', user.firstName)}
                        </h2>
                        <p className="text-lg text-slate-300 max-w-lg leading-relaxed">
                            {t('welcomeSubtitle').replace('{count}', totalRecordings.toString())}
                        </p>
                    </div>
                    
                    <div className="flex gap-3 w-full md:w-auto">
                        <button 
                            onClick={() => onNavigate(AppRoute.RECORDING)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-brand-blue to-brand-violet hover:from-brand-blue/90 hover:to-brand-violet/90 text-white px-6 py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-brand-blue/20 transition-all transform hover:scale-105 active:scale-95">
                            <span className="material-symbols-outlined text-[22px]">mic</span>
                            <span>{t('newRecording')}</span>
                        </button>
                        
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="audio/*" className="hidden" />
                        
                        <button 
                            onClick={handleImportClick}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white px-6 py-3.5 rounded-xl text-sm font-bold backdrop-blur-sm transition-all active:scale-95">
                            <span className="material-symbols-outlined text-[22px]">upload_file</span>
                            <span>{t('importAudio')}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* "HOW IT WORKS" VISUAL GUIDE (From Manual) */}
            <div className="flex flex-col gap-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">lightbulb</span>
                    {t('howItWorks')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Step 1: Capture */}
                    <div className="group bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark p-6 rounded-xl relative overflow-hidden transition-all hover:shadow-lg hover:border-brand-violet/50">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-symbols-outlined text-6xl text-brand-violet">mic</span>
                        </div>
                        <div className="size-12 rounded-lg bg-brand-violet/10 text-brand-violet flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-2xl">mic</span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">{t('step1Title')}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('step1Desc').replace(/\*\*(.*?)\*\*/g, '<strong class="text-brand-violet">$1</strong>') }}></p>
                    </div>

                    {/* Step 2: Transcribe */}
                    <div className="group bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark p-6 rounded-xl relative overflow-hidden transition-all hover:shadow-lg hover:border-brand-blue/50">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-symbols-outlined text-6xl text-brand-blue">description</span>
                        </div>
                        <div className="size-12 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-2xl">description</span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">{t('step2Title')}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('step2Desc') }}></p>
                    </div>

                    {/* Step 3: Analyze */}
                    <div className="group bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark p-6 rounded-xl relative overflow-hidden transition-all hover:shadow-lg hover:border-brand-green/50">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-symbols-outlined text-6xl text-brand-green">auto_awesome</span>
                        </div>
                        <div className="size-12 rounded-lg bg-brand-green/10 text-brand-green flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-2xl">auto_awesome</span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">{t('step3Title')}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('step3Desc').replace(/\*\*(.*?)\*\*/g, '<strong class="text-brand-green">$1</strong>') }}></p>
                    </div>
                </div>
            </div>

            {/* Recent Activity Table */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400">history</span>
                        {t('allRecordings')}
                    </h3>
                    
                    {/* Search Bar */}
                    <div className="relative group w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors text-sm">search</span>
                        </div>
                        <input 
                            className="block w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-border-dark rounded-lg leading-5 bg-white dark:bg-surface-dark text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm transition-all shadow-sm" 
                            placeholder={t('searchPlaceholder')} 
                            type="text" 
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-sm min-h-[300px] transition-colors overflow-hidden">
                    <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-surface-dark/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <div className="col-span-5 pl-2">Conversation</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2">Date</div>
                        <div className="col-span-2">Duration</div>
                        <div className="col-span-1 text-right pr-2">{t('actions')}</div>
                    </div>
                    
                    {filteredRecordings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-50">
                            <span className="material-symbols-outlined text-6xl mb-4 text-slate-400">folder_off</span>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white">{t('noRecordings')}</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">
                                {selectedFolderId === 'ALL' 
                                    ? t('startFirst') 
                                    : t('emptyFolder')}
                            </p>
                        </div>
                    ) : (
                        filteredRecordings.map((rec) => (
                            <div 
                            key={rec.id} 
                            onClick={() => onSelectRecording(rec.id)}
                            className={`group grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center border-b border-slate-200 dark:border-border-dark hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer ${rec.status === 'Processing' ? 'bg-blue-50/50 dark:bg-primary/5' : ''}`}
                            >
                            <div className="col-span-12 md:col-span-5 flex items-start gap-4">
                                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${rec.status === 'Processing' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' : 'bg-blue-100 dark:bg-blue-900/30 text-primary'}`}>
                                <span className={`material-symbols-outlined ${rec.status === 'Processing' ? 'animate-pulse' : ''}`}>{rec.status === 'Processing' ? 'mic' : 'group'}</span>
                                </div>
                                <div>
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{rec.title}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{rec.description}</p>
                                <div className="flex gap-2 mt-2">
                                    {rec.tags.map(tag => (
                                    <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10">{tag}</span>
                                    ))}
                                </div>
                                </div>
                            </div>
                            <div className="col-span-6 md:col-span-2 flex items-center mt-2 md:mt-0">
                                {rec.status === 'Completed' ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {t('completed')}
                                </span>
                                ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/20">
                                    {t('draft')}
                                </span>
                                )}
                            </div>
                            <div className="col-span-6 md:col-span-2 text-sm text-slate-600 dark:text-slate-400 mt-2 md:mt-0">{rec.date}</div>
                            <div className="col-span-6 md:col-span-2 text-sm text-slate-600 dark:text-slate-400 mt-2 md:mt-0 font-mono">{rec.duration}</div>
                            <div className="col-span-6 md:col-span-1 flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity mt-2 md:mt-0 relative">
                                <button className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 hover:text-primary transition-colors" disabled={rec.status === 'Processing'}>
                                    <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                                </button>
                                <div className="relative">
                                    <button 
                                        onClick={(e) => handleActionClick(e, rec.id)}
                                        className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 hover:text-primary transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                    </button>
                                    {activeMenuId === rec.id && (
                                        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg shadow-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                            <button 
                                                onClick={(e) => handleViewContext(e, rec)}
                                                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-lg">folder_open</span>
                                                {t('viewContext')}
                                            </button>
                                            <button 
                                                onClick={(e) => openRenameModal(e, rec.id, rec.title)}
                                                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-lg">edit</span>
                                                {t('rename')}
                                            </button>
                                            <button 
                                                onClick={(e) => openMoveModal(e, rec.id, rec.title)}
                                                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-lg">drive_file_move</span>
                                                {t('moveTo')}
                                            </button>
                                            <div className="h-px bg-slate-200 dark:bg-border-dark my-1"></div>
                                            <button 
                                                onClick={(e) => openDeleteModal(e, rec.id, rec.title)}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                                {t('delete')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* RENAME & DELETE & MOVE MODALS (Action Modals) */}
      {actionModal && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div 
                  onClick={(e) => e.stopPropagation()} 
                  className="bg-[#1e2736] border border-brand-grey/40 ring-1 ring-brand-grey/40 rounded-xl w-full max-w-md animate-in zoom-in-95 duration-200 p-6 flex flex-col gap-4 shadow-2xl shadow-brand-grey/30">
                  
                  {actionModal.type === 'delete' ? (
                      <>
                        <div className="flex items-center gap-3 text-red-500">
                            <span className="material-symbols-outlined text-3xl">warning</span>
                            <h3 className="text-xl font-bold text-white">{t('delete')}</h3>
                        </div>
                        <p className="text-slate-300 text-sm">
                            {t('confirmDelete')} <br/>
                            <span className="font-bold text-white block mt-1">"{actionModal.title}"</span>
                        </p>
                        <div className="flex justify-end gap-3 mt-4">
                            <button 
                                onClick={() => setActionModal(null)}
                                className="px-4 py-2 rounded-lg border border-border-dark text-slate-300 hover:text-white hover:bg-white/5 font-medium text-sm">
                                {t('cancel')}
                            </button>
                            <button 
                                onClick={confirmDelete}
                                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-900/20">
                                {t('delete')}
                            </button>
                        </div>
                      </>
                  ) : actionModal.type === 'move' ? (
                      <>
                        <div className="flex items-center gap-3 text-primary">
                            <span className="material-symbols-outlined text-3xl">drive_file_move</span>
                            <h3 className="text-xl font-bold text-white">{t('selectFolder')}</h3>
                        </div>
                        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                            {folders.map(folder => (
                                <button 
                                    key={folder.id}
                                    onClick={() => confirmMove(folder.id)}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-left group">
                                    <span className={`material-symbols-outlined text-xl ${folder.id === 'hr_confidential' ? 'text-orange-400' : 'text-slate-400 group-hover:text-primary'}`}>
                                        {folder.icon}
                                    </span>
                                    <span className="text-white text-sm font-medium">{folder.name}</span>
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-end mt-2">
                             <button 
                                onClick={() => setActionModal(null)}
                                className="px-4 py-2 rounded-lg border border-border-dark text-slate-300 hover:text-white hover:bg-white/5 font-medium text-sm">
                                {t('cancel')}
                            </button>
                        </div>
                      </>
                  ) : (
                      <>
                        <div className="flex items-center gap-3 text-primary">
                            <span className="material-symbols-outlined text-3xl">edit</span>
                            <h3 className="text-xl font-bold text-white">{t('rename')}</h3>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-300">{t('renamePrompt')}</label>
                            <input 
                                autoFocus
                                type="text" 
                                value={tempRenameTitle}
                                onChange={(e) => setTempRenameTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter') confirmRename();
                                    if(e.key === 'Escape') setActionModal(null);
                                }}
                                className="bg-[#111722] border border-border-dark rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-primary outline-none"
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <button 
                                onClick={() => setActionModal(null)}
                                className="px-4 py-2 rounded-lg border border-border-dark text-slate-300 hover:text-white hover:bg-white/5 font-medium text-sm">
                                {t('cancel')}
                            </button>
                            <button 
                                onClick={confirmRename}
                                disabled={!tempRenameTitle.trim()}
                                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-lg shadow-primary/20 disabled:opacity-50">
                                {t('saveChanges')}
                            </button>
                        </div>
                      </>
                  )}
              </div>
          </div>
      )}

      {/* System Report Modal */}
      {showSystemReport && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div 
                  onClick={(e) => e.stopPropagation()} 
                  className="bg-[#1e2736] border border-brand-grey/40 ring-1 ring-brand-grey/40 rounded-xl w-full max-w-lg animate-in zoom-in-95 duration-200 overflow-hidden shadow-2xl shadow-brand-grey/30">
                  
                  <div className="p-6 border-b border-border-dark flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">health_and_safety</span>
                        {t('sysReportTitle')}
                      </h3>
                      <button onClick={() => setShowSystemReport(false)} className="text-slate-400 hover:text-white">
                          <span className="material-symbols-outlined">close</span>
                      </button>
                  </div>
                  
                  <div className="p-6 flex flex-col gap-4">
                      {/* API Check */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                          <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${systemChecks.api ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                  <span className="material-symbols-outlined">{systemChecks.api ? 'check_circle' : 'error'}</span>
                              </div>
                              <div>
                                  <p className="text-sm font-bold text-white">{t('sysCheckApi')}</p>
                                  <p className="text-xs text-slate-400">{systemChecks.api ? t('statusOk') : t('statusError')}</p>
                              </div>
                          </div>
                      </div>

                      {/* Browser Check */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                          <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${systemChecks.browser ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                  <span className="material-symbols-outlined">{systemChecks.browser ? 'check_circle' : 'warning'}</span>
                              </div>
                              <div>
                                  <p className="text-sm font-bold text-white">{t('sysCheckMic')}</p>
                                  <p className="text-xs text-slate-400">{systemChecks.browser ? t('statusOk') : t('statusWarning')}</p>
                              </div>
                          </div>
                      </div>

                       {/* Storage Check */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                          <div className="flex items-center gap-3 w-full">
                              <div className={`p-2 rounded-lg ${systemChecks.storage < 80 ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                  <span className="material-symbols-outlined">{systemChecks.storage < 80 ? 'database' : 'storage'}</span>
                              </div>
                              <div className="flex-1">
                                  <div className="flex justify-between mb-1">
                                    <p className="text-sm font-bold text-white">{t('sysCheckStorage')}</p>
                                    <p className="text-xs text-slate-400">{(systemChecks.storageBytes / 1024).toFixed(1)} KB {t('storageUsed')}</p>
                                  </div>
                                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                                      <div 
                                          className={`h-1.5 rounded-full ${systemChecks.storage < 80 ? 'bg-green-500' : 'bg-orange-500'}`} 
                                          style={{ width: `${Math.max(systemChecks.storage, 5)}%` }}
                                      ></div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
                  
                  <div className="p-6 bg-slate-900/50 border-t border-border-dark flex justify-end">
                      <button 
                          onClick={() => setShowSystemReport(false)}
                          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-colors">
                          {t('close')}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Context Modal (View Notes/Files) */}
      {viewingRecording && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-[#1e2736] border border-brand-grey/40 ring-1 ring-brand-grey/40 rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200 shadow-2xl shadow-brand-grey/30">
                    <div className="flex items-center justify-between p-6 border-b border-border-dark">
                        <div className="flex flex-col">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">folder_open</span>
                                {t('viewContext')}
                            </h3>
                            <p className="text-sm text-slate-400">{viewingRecording.title}</p>
                        </div>
                        <button 
                            onClick={() => setViewingRecording(null)}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined text-2xl">close</span>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 bg-slate-900/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                            {/* Notes Section */}
                            <div className="flex flex-col gap-4">
                                <h4 className="text-white font-bold flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">edit_note</span>
                                    {t('notes')}
                                </h4>
                                <div className="flex-1 bg-surface-dark border border-border-dark rounded-xl p-4 overflow-y-auto min-h-[200px]">
                                    {!viewingRecording.notes || viewingRecording.notes.length === 0 ? (
                                        <p className="text-slate-500 text-sm text-center mt-10">No notes recorded.</p>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            {viewingRecording.notes.map((note) => (
                                                <div key={note.id} className="flex gap-3">
                                                    <div className="pt-1">
                                                        <div className="text-xs font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">{note.timestamp}</div>
                                                    </div>
                                                    <div className="flex-1 bg-[#161d2a] p-3 rounded-lg rounded-tl-none border border-border-dark">
                                                        <p className="text-sm text-slate-200">{note.text}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Media Section */}
                            <div className="flex flex-col gap-4">
                                <h4 className="text-white font-bold flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">image</span>
                                    {t('media')}
                                </h4>
                                <div className="flex-1 bg-surface-dark border border-border-dark rounded-xl p-4 overflow-y-auto min-h-[200px]">
                                    {!viewingRecording.media || viewingRecording.media.length === 0 ? (
                                        <p className="text-slate-500 text-sm text-center mt-10">No media uploaded.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-3">
                                            {viewingRecording.media.map((item) => (
                                                <div key={item.id} className="relative aspect-video rounded-lg overflow-hidden border border-border-dark group">
                                                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                                    <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                                                        {item.timestamp}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 border-t border-border-dark flex justify-end bg-[#161d2a] rounded-b-2xl">
                        <button 
                            onClick={() => setViewingRecording(null)}
                            className="px-4 py-2 rounded-lg bg-surface-dark hover:bg-[#2f3e5c] text-white text-sm font-bold transition-colors border border-border-dark"
                        >
                            {t('close')}
                        </button>
                    </div>
                </div>
          </div>
      )}
    </div>
  );
};
