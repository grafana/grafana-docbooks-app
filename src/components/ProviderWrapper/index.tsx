import React from 'react';

import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '@/state';

type Props = {
  children: React.ReactNode;
};

export const ProviderWrapper = ({ children }: Props) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
