const Route = {
  inAmount: "",
  outAmount: "",
  priceImpactPct: 0,
  marketInfos: [],
  amount: "",
  slippageBps: 0,
  otherAmountThreshold: "",
  swapMode: "",
  fees: {
    signatureFee: 0,
    openOrdersDeposits: [],
    ataDeposits: [],
    totalFeeAndDeposits: 0,
    minimumSOLForTransaction: 0,
  },
};

const MarketInfo = {
  id: "",
  label: "",
  inputMint: "",
  outputMint: "",
  notEnoughLiquidity: false,
  inAmount: "",
  outAmount: "",
  minInAmount: "",
  minOutAmount: "",
  priceImpactPct: 0,
  lpFee: null,
  platformFee: null,
};

const Fee = {
  amount: "",
  mint: "",
  pct: 0,
};

const SwapResponse = {
  swapTransaction: "",
};

const TokenInfo = {
  symbol: "",
  balance: 0,
};

const TokensObject = {};

module.exports = {
  Route: Route,
  MarketInfo: MarketInfo,
  Fee: Fee,
  SwapResponse: SwapResponse,
  TokenInfo: TokenInfo,
  TokensObject: TokensObject,
};
