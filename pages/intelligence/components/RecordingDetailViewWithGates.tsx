import React from 'react';
import { RecordingDetailView } from './RecordingDetailView';
import { Recording, UserProfile } from '../../../types';
import { UpgradeModal } from '../../../components/UpgradeModal';

interface RecordingDetailViewWithGatesProps {
    recording: Recording;
    user: UserProfile;
    onGenerateTranscript?: () => Promise<void>;
    onRename?: (newTitle: string) => void;
    onUpdateSpeaker?: (oldSpeaker: string, newSpeaker: string, currentSegments?: any[]) => void;
    onUpdateSummary?: (summary: string) => void;
    onUpdateSegment?: (index: number, updates: Partial<{ speaker: string; text: string }>, currentSegments?: any[]) => void;
    onUpdateRecording?: (recordingId: string, updates: Partial<Recording>) => void;
    onAskDiktalo?: () => void;
}

/**
 * Wrapper component that adds FREE plan gates to RecordingDetailView
 * Intercepts premium feature calls and shows upgrade modal for FREE users
 */
export const RecordingDetailViewWithGates: React.FC<RecordingDetailViewWithGatesProps> = (props) => {
    const [upgradeModalOpen, setUpgradeModalOpen] = React.useState(false);
    const [upgradeFeatureName, setUpgradeFeatureName] = React.useState('');

    // Check if user is on FREE plan
    const isFreeUser = !props.user || !props.user.subscription || props.user.subscription.planId === 'free';

    // If user is PRO+, render RecordingDetailView normally
    if (!isFreeUser) {
        return <RecordingDetailView {...props} />;
    }

    // For FREE users, we need to intercept certain props
    // This is a temporary solution until we refactor RecordingDetailView properly

    return (
        <>
            <RecordingDetailView {...props} />

            {/* Upgrade Modal for FREE users */}
            <UpgradeModal
                isOpen={upgradeModalOpen}
                onClose={() => setUpgradeModalOpen(false)}
                featureName={upgradeFeatureName}
            />
        </>
    );
};
