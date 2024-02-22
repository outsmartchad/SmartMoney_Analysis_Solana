const {
  Connection,
  PublicKey,
  VersionedTransaction,
  sendAndConfirmRawTransaction,
} = require("@solana/web3.js");
const fetch = require("cross-fetch");
const { Wallet } = require("@project-serum/anchor");
const base58 = require("bs58");

const convertToInteger = (amount, decimals) => {
  return Math.floor(amount * 10 ** decimals);
};
/**
 * Get quote for the swap
 * @param {string} addressOfTokenOut The token we are selling
 * @param {string} addressOfTokenIn The token we are buying
 * @param {number} convertedAmountOfTokenOut amount of tokens we are selling
 * @param {number} slippage The slippage percentage, 9 => 9%
 * @param {boolean} buy If true => buy, else => sell
 * @returns Promise<QuoteResponse>
 */
const getQuote = async (
  addressOfTokenOut,
  addressOfTokenIn,
  convertedAmountOfTokenOut,
  slippage
) => {
  slippage *= 100;
  const url = `https://quote-api.jup.ag/v6/quote?inputMint=${addressOfTokenIn}\
  &outputMint=${addressOfTokenOut}\
  &amount=${convertedAmountOfTokenOut}\
  &slippageBps=${slippage}`;
};
/**
 * Get serialized transactions for the swap
 * @returns {Promise<string>} swapTransaction
 */
const getSwapTx = async (quoteResponse, publickey, buy, mint_address) => {
  try {
    let body = {
      quoteResponse, // the route for the swap
      userPublicKey: publickey, // user's public key to be used for swap
      wrapAndUnwrapSol: true, // auto wrap and unwrap SOL. default is true
      restrictIntermediateTokens: false,
      prioritizationFeeLamports: "auto",
      // the param is for fee account
      autoMultiplier: 2,
    };
    const resp = await fetch("https://quote-api.jup.ag/v6/swap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const swapResponse = await resp.json();
    return swapResponse.swapTransaction; // the serialized transaction
  } catch (e) {
    throw new Error(e);
  }
};
/**
 * @param {*} swapTx: string
 * @param {*} wallet: Wallet
 * @param {*} connection: solana connection
 * @returns Promise<string> txid
 */
const finalizeTx = async (swapTx, wallet, connection) => {
  try{

  
  // deserialize the transaction
  const swapTxBuffer = Buffer.from(swapTx, "base64");
  let tx = VersionedTransaction.deserialize(swapTxBuffer);

  // sign the transaction
  tx.sign([wallet.payer]);

  // execute the transaction
  const rawTx = tx.serialize();
  const txid = await connection.sendRawTransaction(rawTx, {
    skipPreflight: false,
    preflightCommitment: "confirmed",
  });
  await connection.confirmTransaction(txid);

  console.log(`https://solscan.io/tx/${txid}`);
  return txid;
}catch(e){
    throw new Error(e);
}
};

const createConnection = (RPC_ENDPOINT) => {
  try {
    const connection = new Connection(RPC_ENDPOINT);
    return connection;
  } catch (e) {
    throw new Error(e);
  }
};
module.exports = {
  getQuote,
  convertToInteger,
  getSwapTx,
  finalizeTx,
  createConnection,
};
