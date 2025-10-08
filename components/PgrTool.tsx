
import React, { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import PgrLoginScreen from './PgrLoginScreen';
import PgrCalculator from './PgrCalculator';
import PgrAdminView from './PgrAdminView';

const PgrTool: React.FC = () => {
    const { conversations, activeConversationId } = useAppStore();

    const activeConversation = useMemo(() => 
        conversations.find(c => c.id === activeConversationId), 
        [conversations, activeConversationId]
    );

    const isAuthenticated = !!activeConversation?.pgrAuthenticatedSellerId;
    const isAdmin = activeConversation?.pgrAuthenticatedSellerId === 'admin';

    if (isAuthenticated) {
        if (isAdmin) {
            return <PgrAdminView />;
        }
        return <PgrCalculator />;
    }

    return <PgrLoginScreen />;
};

export default PgrTool;