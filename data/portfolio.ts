export type Asset = {
    id: string;
    ticker: string;
    name: string;
    shares: number;
    avgPrice: number;
    currentPrice: number;
  };
  
  export const mockPortfolio: Asset[] = [
    {
      id: '1',
      ticker: 'AAPL',
      name: 'Apple Inc.',
      shares: 10,
      avgPrice: 160,
      currentPrice: 185,
    },
    {
      id: '2',
      ticker: 'VOO',
      name: 'Vanguard S&P 500 ETF',
      shares: 5,
      avgPrice: 380,
      currentPrice: 410,
    },
    {
      id: '3',
      ticker: 'TSLA',
      name: 'Tesla Inc.',
      shares: 3,
      avgPrice: 700,
      currentPrice: 650,
    },
  ];