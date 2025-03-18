'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../ui/LoadingSpinner';

interface TipButtonProps {
  chatId: string;
  personaName: string;
  suggestedAmounts?: number[];
  onSuccess?: (amount: number) => void;
}

export default function TipButton({ 
  chatId, 
  personaName, 
  suggestedAmounts = [1, 3, 5],
  onSuccess 
}: TipButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenTipDialog = () => {
    setIsOpen(true);
    setSelectedAmount(null);
    setCustomAmount('');
    setMessage('');
  };

  const handleCloseTipDialog = () => {
    setIsOpen(false);
  };

  const handleSelectAmount = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only allow numbers and decimals
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      setCustomAmount(value);
      setSelectedAmount(null);
    }
  };

  const handleSubmit = async () => {
    const tipAmount = selectedAmount || (customAmount ? parseFloat(customAmount) : null);
    
    if (!tipAmount || tipAmount <= 0) {
      toast.error('Please select a valid tip amount');
      return;
    }

    if (tipAmount > 100) {
      // Confirm large tips
      if (!confirm(`Are you sure you want to send a $${tipAmount} tip?`)) {
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/tips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: tipAmount,
          chatId,
          message: message.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'Insufficient credits') {
          toast.error(`Insufficient credits. You need $${data.required} but have $${data.credits}.`);
        } else {
          toast.error(data.error || 'Failed to send tip');
        }
        return;
      }

      toast.success(`You sent a $${tipAmount} tip to ${personaName}!`);
      setIsOpen(false);
      
      if (onSuccess) {
        onSuccess(tipAmount);
      }
    } catch (error) {
      console.error('Error sending tip:', error);
      toast.error('Failed to send tip. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const effectiveAmount = selectedAmount || (customAmount ? parseFloat(customAmount) : 0);

  return (
    <>
      <button
        onClick={handleOpenTipDialog}
        className="flex items-center px-3 py-1.5 text-sm bg-primary/20 text-primary hover:bg-primary/30 rounded-full transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M16 8h-6a2 2 0 100 4h4a2 2 0 110 4H8" />
          <path d="M12 18V6" />
        </svg>
        Tip
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-midnight-lighter border border-primary/30 rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-primary">
                Send a tip to {personaName}
              </h3>
              <button
                onClick={handleCloseTipDialog}
                className="text-white opacity-70 hover:text-primary hover:opacity-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-white mb-1">
                Select amount
              </label>
              <div className="flex gap-2 mb-3">
                {suggestedAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleSelectAmount(amount)}
                    className={`px-4 py-2 rounded-md ${
                      selectedAmount === amount
                        ? 'bg-primary text-white'
                        : 'bg-secondary-dark text-white hover:bg-secondary'
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
                <button
                  onClick={() => setSelectedAmount(null)}
                  className={`px-4 py-2 rounded-md ${
                    !selectedAmount && customAmount
                      ? 'bg-primary text-white'
                      : 'bg-secondary-dark text-white hover:bg-secondary'
                  }`}
                >
                  Custom
                </button>
              </div>

              {(!selectedAmount || customAmount) && (
                <div className="mb-3">
                  <label className="block text-sm font-medium text-white mb-1">
                    Custom amount
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white opacity-70">
                      $
                    </span>
                    <input
                      type="text"
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                      placeholder="Enter amount"
                      className="pl-8 w-full py-2 px-3 border border-primary/30 rounded-md bg-secondary-dark text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/80"
                    />
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-1">
                  Add a message (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Great conversation!"
                  className="w-full py-2 px-3 border border-primary/30 rounded-md bg-secondary-dark text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/80"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-white opacity-70">
                Tip amount: <span className="font-semibold text-primary">${effectiveAmount.toFixed(2)}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCloseTipDialog}
                  className="px-4 py-2 text-sm font-medium text-white border border-primary/30 bg-secondary-dark hover:bg-secondary rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!effectiveAmount || isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-light rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <LoadingSpinner size="small" /> : 'Send Tip'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
