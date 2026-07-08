'use client';

import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getFullnodeUrl } from '@mysten/sui/client';
import { useState, type ReactNode } from 'react';

const networks = {
  testnet: { url: getFullnodeUrl('testnet') },
};

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork="testnet">
        <WalletProvider>{children}</WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
