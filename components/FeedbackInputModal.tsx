import React, { useState } from 'react';
import Modal from './ui/Modal';
import { useAppStore } from '../store/useAppStore';

const FeedbackInputModal: React.FC = () => {
  const { feedbackModalState, closeFeedbackModal, submitNegativeFeedback } = useAppStore();
  const [reason, setReason] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = () => {
    if (!reason.trim()) return;
    setIsSending(true);
    // Simulate async operation to give user feedback
    setTimeout(() => {
        submitNegativeFeedback(reason);
        setReason('');
        setIsSending(false);
    }, 500);
  };

  const handleClose = () => {
    if (isSending) return;
    setReason('');
    closeFeedbackModal();
  }

  return (
    <Modal
      isOpen={feedbackModalState.isOpen}
      onClose={handleClose}
      title="Feedback sobre a Resposta"
    >
        <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              Poderia nos dizer o motivo de não ter gostado da resposta gerada? Seu feedback é muito importante para nós.
            </p>
            <div>
                <textarea
                    id="feedback-reason"
                    rows={5}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="mt-1 block w-full rounded-md border-transparent shadow-sm focus:border-greatek-blue focus:ring-greatek-blue sm:text-sm p-2 bg-greatek-border text-text-primary placeholder:text-text-secondary"
                    placeholder="Ex: A resposta estava incorreta, incompleta, não seguiu as instruções, etc."
                />
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={isSending || !reason.trim()}
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-greatek-blue px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-greatek-dark-blue focus:outline-none focus:ring-2 focus:ring-greatek-blue focus:ring-offset-2 disabled:bg-gray-400"
              >
                {isSending ? 'Enviando...' : 'Enviar Feedback'}
              </button>
            </div>
        </div>
    </Modal>
  );
};

export default FeedbackInputModal;
