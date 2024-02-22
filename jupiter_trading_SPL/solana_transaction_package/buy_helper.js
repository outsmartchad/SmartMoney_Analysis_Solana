const { Connection, PublicKey } = require("@solana/web3.js");
const { Wallet } = require("@project-serum/anchor");
const swapper = require("./swap_helper.js");
const { SOLANA_ADDRESS } = require("../const.js");
// mint.value.data => {parsed: {
//     info: {
//         decimals: 9,
//         freezeAuthority: null,
//         isInitialized: true,
//         mintAuthority: null,
//         supply: '0'
//       },
//       type: 'mint'
//     },
//     program: 'spl-token',
//     space: 82}
// const mint = connection
//   .getParsedAccountInfo(
//     new PublicKey(SOLANA_ADDRESS) // the token that we use for buy other token
//   )
//   .then((mint) => {
//     console.log(mint.value.data);
//   });

/**
 * buy other token using the balance of solana
 * @param {string} addressOfTokenIn the token we are getting back
 * @param {number} AmountOfTokenOut amount of solana used to swap
 * @param {number} slippage The slippage percentage, 9 => 9%
 * @param {Connection} connection, solana RPC node's connection
 * @params {Wallet} wallet, the solana ecosystem's wallet object
 * @returns {txID} => this confirmed that the tx has been finalised
 */
const buy_Token = async (
  addressOfTokenIn,
  AmountOfTokenOut,
  slippage,
  connection,
  wallet
) => {
  try {
    // getting the mint address of that spl token
    let mint = await connection.getParsedAccountInfo(
      new PublicKey(SOLANA_ADDRESS) // we use solana for buying other spl token
    );
    if (!mint || !mint.value || mint.value.data instanceof Buffer) {
      throw new Error("Could not find any mint address of solana");
    }
    // getting the decimals of the mint token
    const decimals = mint.value.data.parsed.info.decimals;
    const convertedDecimals = swapper.convertToInteger(
      AmountOfTokenOut,
      decimals
    );
    // getting the quote of response of jupiter swap api
    const quoteResponse = swapper.getQuote(
      SOLANA_ADDRESS,
      addressOfTokenIn,
      convertedDecimals,
      slippage
    );
    // getting the swap details
    const swapTransaction = swapper.getSwapTx(
      quoteResponse,
      wallet.publicKey.toString(),
      true,
      addressOfTokenIn
    );
    // finalized the tx that we have made, and wait
    const finalisedTx = swapper.finalizeTx(swapTransaction, wallet, connection);
    try {
      let subsId;

      subsId = await connection.onSignature(
        finalisedTx,
        (updatedTxInfo, context) => {
          if (updatedTxInfo.err) {
            console.log("Transaction is failed: ", updatedTxInfo.err);
          } else {
            console.log("Transaction is confirmed in solana network! ✅");
          }
        },
        "finalized"
      );
    } finally {
      if (subsId) {
        connection.removeSignatureListener(subsId);
      }
    }
  } catch (e) {
    if (e.message.startsWith("TransactionExpiredTimeoutError")) {
      const match = error.message.match(/Check signature (\w+) using/);
      if (match) {
        const expiredTxId = match[1];
        const status = await connection.getSignatureStatus(expiredTxId);
        if (
          status &&
          status.value &&
          status.value.confirmationStatus === "finalized" &&
          status.value.err === null
        ) {
          return expiredTxId;
        }
      }
      throw new Error("The transaction is expired!");
    }
    throw new Error(e.message);
  }
};
