import { useEffect, useState } from 'react';
import { getTransactions } from '../storage/transactions';
import { getPortfolioFromTransactions } from '../services/portfolio';
import { getPriceForTicker } from '../services/prices';
import { PortfolioItem } from '../constants/types';

export type ExtendedItem = PortfolioItem & {
  currentPrice: number | null;
  marketValue: number | null;
  profit: number | null;
  profitPercent: number | null;
};

export function usePortfolio() {
  const [portfolio, setPortfolio] = useState<ExtendedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshPortfolio = async () => {
    setLoading(true);
    const transactions = await getTransactions();
    const basePortfolio = getPortfolioFromTransactions(transactions);

    const enrichedPortfolio: ExtendedItem[] = await Promise.all(
      basePortfolio.map(async (item) => {
        const currentPrice = await getPriceForTicker(item.ticker, item.assetType);
        const marketValue = currentPrice !== null ? currentPrice * item.shares : null;
        const cost = item.avgPrice * item.shares;
        const profit = marketValue !== null ? marketValue - cost : null;
        const profitPercent = profit !== null ? (profit / cost) * 100 : null;

        return {
          ...item,
          currentPrice: currentPrice ?? null,
          marketValue,
          profit,
          profitPercent,
        };
      })
    );

    setPortfolio(enrichedPortfolio);
    setLoading(false);
  };

  useEffect(() => {
    refreshPortfolio();
  }, []);

  return { portfolio, loading, refreshPortfolio };
}