import { useEffect, useState } from 'react';
import { getTransactions } from '../storage/transactions';
import { getPortfolioFromTransactions } from '../services/portfolio';
import { getPriceForTicker } from '../services/prices';
import { PortfolioItem } from '../constants/types';

export type ExtendedItem = PortfolioItem & {
  currentPrice: number | null;
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
        const price = await getPriceForTicker(item.ticker, item.assetType);
        return {
          ...item,
          currentPrice: price ?? null,
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