const { Connection, PublicKey } = require("@solana/web3.js");
const { Wallet } = require("@project-serum/anchor");
const swapper = require("./swap_helper.js");
const { SOLANA_ADDRESS } = require("../const.js");

/**
 * buy other token using the balance of solana or other stable coins
 * @param {string} addressOfTokenIn The token we are selling out, => the token
 * @param {number} AmountOfTokenOut amount of tokens out
 * @param {number} slippage The slippage percentage, 9 => 9%
 * @param {Connection} connection, solana RPC node's connection
 * @params {Wallet} wallet, the solana ecosystem's wallet object
 * @returns {txID} => this confirmed that the tx has been finalised
 */

const sell_token = async (
  addressOfTokenIn,
  AmountOfTokenOut,
  slippage,
  connection,
  wallet
) => {
  const mint = await connection.getParsedAccountInfo(SOLANA_ADDRESS);
  if (!mint || !mint.value || !mint.value.data instanceof Buffer) {
    throw new Error("Could not find any mint address of solana!");
  }
  const quoteOfSell = swapper.getQuote(addressOfTokenIn, SOLANA_ADDRESS);
};
