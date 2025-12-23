
import { supabase } from '../lib/supabase';

export type LogLevel = 'info' | 'warn' | 'error';

interface SystemLog {
    id?: string;
    created_at?: string;
    level: LogLevel;
    message: string;
    context?: any;
    user_id?: string;
    url?: string;
}

class LoggingService {
    private static instance: LoggingService;

    private constructor() { }

    public static getInstance(): LoggingService {
        if (!LoggingService.instance) {
            LoggingService.instance = new LoggingService();
        }
        return LoggingService.instance;
    }

    async log(level: LogLevel, message: string, context?: any, userId?: string) {
        const logEntry: SystemLog = {
            level,
            message,
            context: context ? JSON.stringify(context) : null,
            user_id: userId,
            url: window.location.href
        };

        console[level](`[${level.toUpperCase()}] ${message}`, context || '');

        try {
            const { error } = await supabase
                .from('system_logs')
                .insert([logEntry]);

            if (error) {
                console.error('Failed to send log to Supabase:', error);
            }
        } catch (err) {
            console.error('Error in LoggingService:', err);
        }
    }

    async info(message: string, context?: any, userId?: string) {
        return this.log('info', message, context, userId);
    }

    async warn(message: string, context?: any, userId?: string) {
        return this.log('warn', message, context, userId);
    }

    async error(message: string, context?: any, userId?: string) {
        return this.log('error', message, context, userId);
    }
}

export const logger = LoggingService.getInstance();
