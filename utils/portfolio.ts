type Transaction = {
    id: string;
    ticker: string;
    shares: number;
    price: number;
    date: string;
  };
  
  type PortfolioItem = {
    ticker: string;
    shares: number;
    avgPrice: number;
  };
  
  export function getPortfolioFromTransactions(transactions: Transaction[]): PortfolioItem[] {
    const map = new Map<string, { totalShares: number; totalCost: number }>();
  
    for (const tx of transactions) {
      const key = tx.ticker.toUpperCase();
      const existing = map.get(key) || { totalShares: 0, totalCost: 0 };
      const newShares = existing.totalShares + tx.shares;
      const newCost = existing.totalCost + tx.shares * tx.price;
  
      map.set(key, {
        totalShares: newShares,
        totalCost: newCost,
      });
    }
  
    const portfolio: PortfolioItem[] = [];
  
    for (const [ticker, { totalShares, totalCost }] of map) {
      if (totalShares > 0) {
        portfolio.push({
          ticker,
          shares: totalShares,
          avgPrice: parseFloat((totalCost / totalShares).toFixed(2)),
        });
      }
    }
  
    return portfolio;
  }