/**
 * Candlestick panel - financial OHLC charts
 *
 * Use for displaying financial data with open/high/low/close values.
 *
 * @example
 * <Candlestick
 *   title="Stock Price"
 *   mode="candles"
 *   upColor="green"
 *   downColor="red"
 * >
 *   stock_price
 * </Candlestick>
 */

import { createComponent } from '../../../base.js';
import type { BasePanelProps } from '../../../../types/panel-base.js';
import type {
  LegendConfig,
  LegendPlacement,
} from '../../../../types/display.js';

export interface CandlestickProps extends BasePanelProps {
  /** Mode */
  mode?: 'candles' | 'volume' | 'both';
  /** Candle style */
  candleStyle?: 'candles' | 'ohlcbars';
  /** Color strategy */
  colorStrategy?: 'open-close' | 'close-close';
  /** Open field */
  openField?: string;
  /** High field */
  highField?: string;
  /** Low field */
  lowField?: string;
  /** Close field */
  closeField?: string;
  /** Volume field */
  volumeField?: string;
  /** Up color */
  upColor?: string;
  /** Down color */
  downColor?: string;
  /** Legend configuration */
  legend?: LegendConfig | LegendPlacement;
}

export const Candlestick = createComponent<CandlestickProps>('candlestick');
