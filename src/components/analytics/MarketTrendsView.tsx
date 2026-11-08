import React from 'react';
import { LocalityTrend } from '../../data/marketTrendsData';
import { MarketMapVisualization } from './MarketMapVisualization';

interface MarketTrendsViewProps {
  onApplyLocalityToStudio: (locality: LocalityTrend) => void;
}

export const MarketTrendsView: React.FC<MarketTrendsViewProps> = ({
  onApplyLocalityToStudio,
}) => {
  return (
    <div className="max-w-7xl mx-auto pb-16">
      <MarketMapVisualization onApplyLocalityToStudio={onApplyLocalityToStudio} />
    </div>
  );
};

export default MarketTrendsView;
