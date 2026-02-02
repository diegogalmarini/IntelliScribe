
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        // Safety timeout in case Supabase hangs (e.g. ad blockers)
        const safetyTimeout = setTimeout(() => {
            if (mounted && loading) {
                console.warn("Auth check timed out. Forcing load completion.");
                setLoading(false);
            }
        }, 4000);

        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (mounted) {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
                clearTimeout(safetyTimeout);
            }
        }).catch(err => {
            console.error("Auth session error:", err);
            if (mounted) setLoading(false);
        });

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (mounted) {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);

                // Track login activity
                if (event === 'SIGNED_IN' && session?.user) {
                    import('../utils/authTracking').then(({ trackLogin }) => {
                        trackLogin(session.user.id);
                    });
                }

                // --- EXTENSION SYNC BRIDGE ---
                // DISABLED: This was causing Realtime reconnection loops
                // Extension now uses manual token input only
                /*
                if ((event === 'SIGNED_IN' || event === 'SIGNED_OUT') && session) {
                    window.dispatchEvent(new CustomEvent('DIKTALO_SESSION_SYNC', {
                        detail: {
                            access_token: session.access_token,
                            refresh_token: session.refresh_token,
                            expires_at: session.expires_at,
                            user: session.user
                        }
                    }));
                }
                */
            }
        });

        return () => {
            mounted = false;
            clearTimeout(safetyTimeout);
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const value = {
        session,
        user,
        loading,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
