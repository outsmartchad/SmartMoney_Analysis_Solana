const {
  Connection,
  Keypair,
  VersionedTransaction,
  LAMPORTS_PER_SOL,
} = require("@solana/web3.js");
const dotenv = require("dotenv");
dotenv.config();
const fetch = require("cross-fetch");
const { Wallet } = require("@project-serum/anchor");
const {
  SOLANA_ADDRESS,
  SOLANA_TOKENPROGRAM_ID,
} = require("./solana_transaction_package/const.js");
const bs58 = require("bs58");
const API_KEY = process.env.Helius_API_Key;
const RPC = process.env.RPC;
const PRIVATE_KEY = process.env.Trading_PRIVATE_KEY;
// RPC end point
const c = new Connection(RPC + API_KEY);
// Wallet object
const w = new Wallet(Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY || "")));

// get the wallet's balance as sol
async function getSOLBalance(publicKey) {
  const balance = await c.getBalance(publicKey);
  return balance / LAMPORTS_PER_SOL;
}

// function
// inputToken=So11111111111111111111111111111111111111112, this is solana contract address
// outputToken=HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3, PYTH contract address
async function swapTokenAtoTokenB(addressA, addressB, amt) {
  // Swapping SOL to USDC with input 0.1 SOL and 0.5% slippage
  const quoteResponse = await (
    await fetch(
      `https://quote-api.jup.ag/v6/quote?inputMint=${addressA}\
            &outputMint=${addressB}\
            &amount=100000000\
            &slippageBps=50`
    )
  ).json();
  // get serialized transactions for the swap
  const { swapTransaction } = await (
    await fetch("https://quote-api.jup.ag/v6/swap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quoteResponse,
        userPublicKey: w.publicKey.toString(),
        wrapAndUnwrapSol: true,
      }),
    })
  ).json();
  // deserialize the transaction
  // const swapTranBuf = Buffer.from(swapTransaction, "base64");
  // var transaction = VersionedTransaction.deserialize(swapTranBuf);
  // console.log(transaction);
  // sign the transaction
  // broadcast the transaction
}
console.log(SOLANA_ADDRESS);
getSOLBalance(w.publicKey).then((balance) => {
  console.log("SOL balance: ", balance);
});

// console.log(
//   swapTokenAtoTokenB(
//     (addressA = "So11111111111111111111111111111111111111112"),
//     (addressB = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
//     (amt = 100000000)
//   ).then((response) => {
//     console.log(response);
//   })
// );
