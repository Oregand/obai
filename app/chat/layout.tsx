'use client';

import React from 'react';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This creates a completely dedicated layout for the chat page
  // This ensures we have full control over the CSS and positioning
  return (
    <div className="w-full h-screen max-h-screen overflow-hidden bg-midnight">
      {children}
    </div>
  );
}
