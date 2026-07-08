import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';

const TESTNET_URL =
  process.env.NEXT_PUBLIC_SUI_RPC_URL ?? getFullnodeUrl('testnet');

export const suiClient = new SuiClient({ url: TESTNET_URL });

export const SUI_COIN_TYPE = '0x2::sui::SUI';

export interface CoinBalance {
  coinType: string;
  totalBalance: bigint;
  coinObjectCount: number;
}

export interface CoinMetadata {
  decimals: number;
  symbol: string;
  name: string;
  iconUrl: string | null;
}

export async function getSuiBalance(address: string): Promise<bigint> {
  const { totalBalance } = await suiClient.getBalance({ owner: address });
  return BigInt(totalBalance);
}

export async function getCoinBalance(
  address: string,
  coinType: string,
): Promise<CoinBalance> {
  const res = await suiClient.getBalance({ owner: address, coinType });
  return {
    coinType,
    totalBalance: BigInt(res.totalBalance),
    coinObjectCount: res.coinObjectCount,
  };
}

export async function getAllCoinBalances(address: string): Promise<CoinBalance[]> {
  const cursor = await suiClient.getAllBalances({ owner: address });
  return cursor.map((entry) => ({
    coinType: entry.coinType,
    totalBalance: BigInt(entry.totalBalance),
    coinObjectCount: entry.coinObjectCount,
  }));
}

const metadataCache = new Map<string, CoinMetadata | null>();

export async function getCoinMetadata(coinType: string): Promise<CoinMetadata | null> {
  const cached = metadataCache.get(coinType);
  if (cached !== undefined) return cached;
  try {
    const info = await suiClient.getCoinMetadata({ coinType });
    if (!info) {
      metadataCache.set(coinType, null);
      return null;
    }
    const meta: CoinMetadata = {
      decimals: info.decimals,
      symbol: info.symbol,
      name: info.name,
      iconUrl: info.iconUrl ?? null,
    };
    metadataCache.set(coinType, meta);
    return meta;
  } catch {
    metadataCache.set(coinType, null);
    return null;
  }
}
