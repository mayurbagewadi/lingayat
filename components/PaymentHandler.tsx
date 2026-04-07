import React, { useEffect, useState } from 'react';
import styles from './PaymentHandler.module.css';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentHandlerProps {
  orderId: string;
  amount: number;
  currency: string;
  userEmail: string;
  userName: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
}

export default function PaymentHandler({
  orderId,
  amount,
  currency,
  userEmail,
  userName,
  onSuccess,
  onError
}: PaymentHandlerProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: orderId,
        amount: amount * 100,
        currency: currency,
        name: 'Lingayat Mali Matrimonial',
        description: 'Subscription Payment',
        prefill: {
          name: userName,
          email: userEmail
        },
        handler: async (response: any) => {
          // Verify payment on backend
          try {
            const verifyResponse = await fetch('/api/subscription/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
              },
              body: JSON.stringify({
                razorpay_order_id: orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            onSuccess(response.razorpay_payment_id);
          } catch (error) {
            onError(error instanceof Error ? error.message : 'Verification failed');
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Payment failed');
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Complete Payment</h2>
        <div className={styles.details}>
          <div className={styles.detailRow}>
            <span>Amount:</span>
            <span className={styles.amount}>₹{amount}</span>
          </div>
          <div className={styles.detailRow}>
            <span>Order ID:</span>
            <span className={styles.orderId}>{orderId}</span>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handlePayment}
          disabled={isProcessing}
          style={{ width: '100%' }}
        >
          {isProcessing ? (
            <>
              <span className="spinner"></span>
              Opening Payment...
            </>
          ) : (
            'Proceed to Payment'
          )}
        </button>

        <p className={styles.secureNote}>
          🔒 Payments are secured by Razorpay
        </p>
      </div>
    </div>
  );
}
