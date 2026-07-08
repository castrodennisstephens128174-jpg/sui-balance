'use client';

import { ConnectModal, useCurrentAccount, useDisconnectWallet, useCurrentWallet } from '@mysten/dapp-kit';
import { LogOut, Wallet } from 'lucide-react';
import { useState } from 'react';
import { shortAddress } from '@/ui/format';

export function ConnectButton() {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const { connectionStatus } = useCurrentWallet();
  const isConnecting = connectionStatus === 'connecting';
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  if (account) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2 text-sm font-medium text-ink shadow-sm transition hover:border-brand-100"
        >
          <span className="h-2 w-2 rounded-full bg-positive" />
          <span className="tnum">{shortAddress(account.address)}</span>
        </button>
        {open && (
          <>
            <button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-10 cursor-default"
              onClick={() => setOpen(false)}
            />
            <div className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-line bg-white p-1.5 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  disconnect();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-soft transition hover:bg-mist"
              >
                <LogOut className="h-4 w-4" />
                Disconnect
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        disabled={isConnecting}
        onClick={() => setModalOpen(true)}
        className="btn-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60"
      >
        <Wallet className="h-4 w-4" />
        {isConnecting ? 'Connecting…' : 'Connect wallet'}
      </button>
      <ConnectModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        trigger={<span className="hidden" />}
      />
    </>
  );
}
