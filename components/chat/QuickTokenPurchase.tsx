'use client';

// Re-export the QuickTokenPurchase component from the payment directory
// This maintains compatibility with existing imports

import QuickTokenPurchase from '../payment/QuickTokenPurchase';

export default function ChatQuickTokenPurchase(props: React.ComponentProps<typeof QuickTokenPurchase>) {
  // Pass through all props with simpleMode enabled by default
  return <QuickTokenPurchase {...props} simpleMode={props.simpleMode !== undefined ? props.simpleMode : true} />;
}
