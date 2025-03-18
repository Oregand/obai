export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX';

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }: {
  action: string;
  category: string;
  label: string;
  value?: number;
}) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Custom events for tracking app-specific actions
export const trackLogin = (method: string) => {
  event({
    action: 'login',
    category: 'authentication',
    label: method,
  });
};

export const trackSignup = (method: string) => {
  event({
    action: 'signup',
    category: 'authentication',
    label: method,
  });
};

export const trackChatCreated = () => {
  event({
    action: 'chat_created',
    category: 'chat',
    label: 'new_chat',
  });
};

export const trackPersonaCreated = (isCustom: boolean) => {
  event({
    action: 'persona_created',
    category: 'persona',
    label: isCustom ? 'custom' : 'template',
  });
};

export const trackTokenPurchase = (amount: number, value: number) => {
  event({
    action: 'token_purchase',
    category: 'payment',
    label: `${amount} tokens`,
    value: value,
  });
};

export const trackSubscriptionStarted = (tier: string, value: number) => {
  event({
    action: 'subscription_started',
    category: 'payment',
    label: tier,
    value: value,
  });
};
