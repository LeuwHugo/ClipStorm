'use client';

import { useState, useEffect } from 'react';

type Messages = Record<string, any>;

export const useMessages = () => {
  const [messages, setMessages] = useState<Messages>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await import('@/messages/messages.json');
        setMessages(response.default);
      } catch (error) {
        console.error('Failed to load messages:', error);
        setMessages({});
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, []);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value = messages;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    if (typeof value !== 'string') {
      return key;
    }

    // Replace parameters in the translation
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }

    return value;
  };

  return { t, loading };
}; 