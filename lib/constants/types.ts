  // lib/constants/types.ts
export type Transaction = {
    id: string;
    ticker: string;
    shares: number;
    price: number;
    totalAmount: number;
    date: string;
    assetType: 'stock' | 'crypto';
  };
  
  export type PortfolioItem = {
    ticker: string;
    shares: number;
    avgPrice: number;
    assetType: 'stock' | 'crypto';
  };

export type Asset = {
  id: string;
  symbol: string;
  name: string;
  current_price: number | null;
};