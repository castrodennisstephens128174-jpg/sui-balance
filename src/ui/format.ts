export function shortAddress(addr: string, lead = 6, tail = 4): string {
  if (!addr) return '';
  if (addr.length <= lead + tail + 1) return addr;
  return `${addr.slice(0, lead)}…${addr.slice(-tail)}`;
}

export function formatSui(mist: bigint | string | number, decimals = 4): string {
  const value = typeof mist === 'bigint' ? mist : BigInt(mist ?? 0);
  const sui = Number(value) / 1e9;
  if (!Number.isFinite(sui)) return '0';
  return sui.toFixed(decimals).replace(/0+$/, '').replace(/\.$/, '');
}

export function explorerAddress(addr: string): string {
  return `https://suiscan.xyz/testnet/account/${addr}`;
}

export function explorerCoinType(coinType: string): string {
  return `https://suiscan.xyz/testnet/coin/${encodeURIComponent(coinType)}`;
}

export function shortCoinType(coinType: string): string {
  const m = /::([A-Za-z0-9_]+)::([A-Za-z0-9_]+)$/.exec(coinType);
  if (m) return `${m[1]}::${m[2]}`;
  return coinType;
}

export function formatCoinAmount(
  raw: bigint | string | number,
  decimals: number,
  displayDecimals = 4,
): string {
  const value = typeof raw === 'bigint' ? raw : BigInt(raw ?? 0);
  if (decimals === 0) return value.toString();
  const negative = value < 0n;
  const abs = negative ? -value : value;
  const base = 10n ** BigInt(decimals);
  const whole = abs / base;
  const frac = abs % base;
  if (frac === 0n) return `${negative ? '-' : ''}${whole.toString()}`;
  const fracStr = frac.toString().padStart(decimals, '0').slice(0, displayDecimals);
  const trimmed = fracStr.replace(/0+$/, '');
  return `${negative ? '-' : ''}${whole.toString()}${trimmed ? `.${trimmed}` : ''}`;
}
