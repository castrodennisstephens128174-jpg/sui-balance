'use client';

import { useCurrentAccount, useSuiClient, useSuiClientQuery } from '@mysten/dapp-kit';
import { Check, Copy, Search, Wallet } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { SUI_COIN_TYPE, getCoinMetadata, type CoinBalance, type CoinMetadata } from '@/lib/sui';
import { Header } from '@/ui/components/Header';
import { Badge, Button, Card, FieldLabel } from '@/ui/components/ui';
import {
  explorerAddress,
  explorerCoinType,
  formatCoinAmount,
  formatSui,
  shortAddress,
  shortCoinType,
} from '@/ui/format';
import { isValidSuiAddress } from '@mysten/sui/utils';

const LAST_ADDRESS_KEY = 'sui-balance:lastAddress';

export default function BalanceCheckerPage() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const [query, setQuery] = useState('');
  const [resolved, setResolved] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Map<string, CoinMetadata | null>>(new Map());
  const [customCoin, setCustomCoin] = useState<CoinBalance | null>(null);
  const [customInput, setCustomInput] = useState('');
  const [customLoading, setCustomLoading] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(LAST_ADDRESS_KEY);
    if (saved && saved.length > 0) {
      setQuery(saved);
      setResolved(saved);
    }
  }, []);

  useEffect(() => {
    if (account?.address) {
      setQuery(account.address);
      setAddressError(null);
    }
  }, [account?.address]);

  const ownBalances = useSuiClientQuery(
    'getAllBalances',
    { owner: account?.address ?? '' },
    { enabled: !!account?.address, refetchInterval: 15000 },
  );

  const lookupAll = useSuiClientQuery(
    'getAllBalances',
    { owner: resolved ?? '' },
    { enabled: !!resolved, refetchInterval: 15000 },
  );

  const loading = lookupAll.isPending || lookupAll.isFetching;
  const error = resolved && lookupAll.isError ? 'Failed to read balances from the testnet RPC.' : null;

  const balances: CoinBalance[] = useMemo(() => {
    if (!lookupAll.data) return [];
    return lookupAll.data.map((entry) => ({
      coinType: entry.coinType,
      totalBalance: BigInt(entry.totalBalance),
      coinObjectCount: entry.coinObjectCount,
    }));
  }, [lookupAll.data]);

  const ownRows: CoinBalance[] = useMemo(() => {
    if (!ownBalances.data) return [];
    return ownBalances.data.map((entry) => ({
      coinType: entry.coinType,
      totalBalance: BigInt(entry.totalBalance),
      coinObjectCount: entry.coinObjectCount,
    }));
  }, [ownBalances.data]);

  useEffect(() => {
    const unique = new Set(balances.map((b) => b.coinType));
    const missing = Array.from(unique).filter((c) => !metadata.has(c));
    if (missing.length === 0) return;
    let cancelled = false;
    Promise.all(missing.map((c) => getCoinMetadata(c).then((m) => [c, m] as const))).then(
      (entries) => {
        if (cancelled) return;
        setMetadata((prev) => {
          const next = new Map(prev);
          for (const [c, m] of entries) next.set(c, m);
          return next;
        });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [balances, metadata]);

  const suiEntry = balances.find((b) => b.coinType === SUI_COIN_TYPE);
  const totalCoinTypes = balances.length;
  const totalCoinObjects = balances.reduce((acc, b) => acc + b.coinObjectCount, 0);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    const next = query.trim();
    if (!isValidSuiAddress(next)) {
      setAddressError('Address must start with 0x and be 32–66 hex chars.');
      return;
    }
    setAddressError(null);
    setResolved(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LAST_ADDRESS_KEY, next);
    }
  }

  async function handleCustomCheck(e: React.FormEvent) {
    e.preventDefault();
    const coinType = customInput.trim();
    if (!coinType) return;
    const owner = resolved ?? account?.address ?? null;
    if (!owner) return;
    setCustomLoading(true);
    try {
      const [meta, res] = await Promise.all([
        getCoinMetadata(coinType),
        suiClient.getBalance({ owner, coinType }),
      ]);
      setMetadata((prev) => {
        const next = new Map(prev);
        next.set(coinType, meta);
        return next;
      });
      setCustomCoin({
        coinType,
        totalBalance: BigInt(res.totalBalance),
        coinObjectCount: res.coinObjectCount,
      });
    } catch {
      setCustomCoin(null);
    } finally {
      setCustomLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <div className="relative overflow-hidden rounded-2xl border border-line bg-white px-7 py-8 shadow-[0_24px_60px_-32px_rgba(30,27,75,0.45)]">
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand-700 via-brand to-accent"
          />
          <div
            aria-hidden
            className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-accent/15 blur-2xl"
          />
          <div className="relative">
            <div className="flex items-center gap-3">
              <Badge className="mb-0">Sui testnet</Badge>
              <span className="text-xs uppercase tracking-[0.18em] text-ink-soft">Ledger</span>
            </div>
            <h1 className="mt-3 font-display text-[2.6rem] font-bold leading-[1.05] tracking-tight text-ink">
              SUI <span className="text-brand-700">Balance</span>
              <br />
              Checker
            </h1>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft">
              Read the SUI balance of any address on Sui testnet. Connect a wallet to verify the
              signer path.
            </p>
          </div>
        </div>

        <Card className="mt-6">
          <form onSubmit={handleCheck} className="space-y-3">
            <FieldLabel htmlFor="addr">Address</FieldLabel>
            <div className="flex gap-2">
              <input
                id="addr"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (addressError) setAddressError(null);
                }}
                placeholder="0x0000…0000"
                spellCheck={false}
                autoComplete="off"
                aria-invalid={addressError ? true : undefined}
                aria-describedby={addressError ? 'addr-error' : undefined}
                className="field tnum"
              />
              <Button type="submit" disabled={loading || !isValidSuiAddress(query.trim())}>
                <Search className="h-4 w-4" />
                {loading ? 'Reading…' : 'Check'}
              </Button>
            </div>
            {addressError && (
              <p id="addr-error" role="alert" className="text-sm text-rose-700">
                {addressError}
              </p>
            )}
          </form>

          {error && (
            <p className="mt-4 rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-800">{error}</p>
          )}

          {resolved && lookupAll.isFetched && !lookupAll.isError && balances.length === 0 && (
            <p className="mt-4 rounded-xl bg-mist px-3.5 py-2.5 text-sm text-ink-soft">
              No coins found for this address on Sui testnet.
            </p>
          )}

          {resolved && balances.length > 0 && (
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-line bg-gradient-to-br from-brand-50 via-white to-accent-50 px-5 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-ink-soft">Resolved</p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-ink-soft">
                      <a
                        href={explorerAddress(resolved)}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-brand-700 hover:text-brand-800"
                      >
                        {shortAddress(resolved, 10, 6)}
                      </a>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(resolved);
                            setCopied(true);
                            window.setTimeout(() => setCopied(false), 1500);
                          } catch {
                            setCopied(false);
                          }
                        }}
                        aria-label={copied ? 'Copied' : 'Copy address'}
                        title={copied ? 'Copied' : 'Copy address'}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-ink-soft hover:bg-paper hover:text-ink"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.16em] text-ink-soft">Total</p>
                    <p className="mt-1 font-display text-3xl font-bold text-ink tnum">
                      {suiEntry ? `${formatSui(suiEntry.totalBalance)} SUI` : '— SUI'}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line/70 pt-3 text-xs text-ink-soft">
                  <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-line">
                    {totalCoinTypes} coin type{totalCoinTypes === 1 ? '' : 's'}
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-line">
                    {totalCoinObjects} coin object{totalCoinObjects === 1 ? '' : 's'}
                  </span>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-line">
                <table className="w-full text-sm">
                  <thead className="bg-paper-deep text-left text-xs uppercase tracking-wide text-ink-soft">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">Coin</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Balance</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Objects</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {balances.map((b) => {
                      const meta = metadata.get(b.coinType);
                      const isSui = b.coinType === SUI_COIN_TYPE;
                      return (
                        <tr key={b.coinType} className="bg-white">
                          <td className="px-4 py-3">
                            <a
                              href={explorerCoinType(b.coinType)}
                              target="_blank"
                              rel="noreferrer"
                              className="font-medium text-brand-700 hover:text-brand-800"
                            >
                              {meta?.symbol ?? shortCoinType(b.coinType)}
                            </a>
                            <p className="text-xs text-ink-soft">
                              {meta?.name ?? shortCoinType(b.coinType)}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-right tnum">
                            {isSui
                              ? `${formatSui(b.totalBalance)} SUI`
                              : meta
                                ? formatCoinAmount(b.totalBalance, meta.decimals)
                                : '—'}
                          </td>
                          <td className="px-4 py-3 text-right tnum text-ink-soft">
                            {b.coinObjectCount}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>

        <Card className="mt-6">
          <FieldLabel>Look up by coin type</FieldLabel>
          <form onSubmit={handleCustomCheck} className="mt-2 flex gap-2">
            <input
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="0x2::sui::SUI"
              spellCheck={false}
              autoComplete="off"
              className="field tnum"
            />
            <Button type="submit" disabled={customLoading || !customInput.trim()}>
              <Search className="h-4 w-4" />
              {customLoading ? 'Reading…' : 'Lookup'}
            </Button>
          </form>
          {customCoin && (
            <div className="mt-4 rounded-xl border border-line bg-mist px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">
                    {metadata.get(customCoin.coinType)?.symbol ?? shortCoinType(customCoin.coinType)}
                  </p>
                  <p className="text-xs text-ink-soft">
                    {metadata.get(customCoin.coinType)?.name ?? customCoin.coinType}
                  </p>
                </div>
                <div className="text-right tnum">
                  <p className="font-semibold text-ink">
                    {customCoin.coinType === SUI_COIN_TYPE
                      ? `${formatSui(customCoin.totalBalance)} SUI`
                      : metadata.get(customCoin.coinType)
                        ? formatCoinAmount(
                            customCoin.totalBalance,
                            metadata.get(customCoin.coinType)!.decimals,
                          )
                        : '—'}
                  </p>
                  <p className="text-xs text-ink-soft">{customCoin.coinObjectCount} objects</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {account && (
          <Card className="mt-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-ink-soft">Your connected wallet</p>
                <p className="mt-1 font-medium text-ink tnum">
                  {shortAddress(account.address, 10, 6)}
                </p>
              </div>
              <Wallet className="h-5 w-5 text-brand-700" />
            </div>
            {ownRows.length === 0 ? (
              <p className="mt-4 text-ink-soft">No coins yet.</p>
            ) : (
              <div className="mt-4 space-y-2">
                {ownRows.map((b) => {
                  const meta = metadata.get(b.coinType);
                  return (
                    <div
                      key={b.coinType}
                      className="flex items-center justify-between rounded-lg border border-line bg-white px-3 py-2"
                    >
                      <span className="font-medium text-ink">
                        {meta?.symbol ?? shortCoinType(b.coinType)}
                      </span>
                      <span className="tnum text-ink-soft">
                        {b.coinType === SUI_COIN_TYPE
                          ? `${formatSui(b.totalBalance)} SUI`
                          : meta
                            ? formatCoinAmount(b.totalBalance, meta.decimals)
                            : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="mt-4 text-xs text-ink-soft">
              Read via dapp-kit useSuiClientQuery · Sui testnet
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}