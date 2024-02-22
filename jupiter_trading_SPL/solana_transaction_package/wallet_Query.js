const {
  PublicKey,
  Connection,
  ParsedAccountData,
  AccountInfo,
  LAMPORTS_PER_SOL,
} = require("@solana/web3.js");
const dotenv = require("dotenv");
dotenv.config();
const { SOLANA_ADDRESS, SOLANA_TOKENPROGRAM_ID } = require("../const.js");
// const API_KEY = process.env.Helius_API_Key;
// const RPC = process.env.RPC;
// const { TokensObject } = require("../type.js");
// const PRIVATE_KEY = process.env.Trading_PRIVATE_KEY;
// const connection = new Connection(RPC + API_KEY);

/**
 * Gets amount of tokens in wallet for given token
 * @param {string} publicAddress
 * @param {string} addressOfToken
 * @param {object} connection
 * @returns {Promise<number> || Promise<boolean>} amountOfToken
 */
const getBalanceOfToken = async (
  publicKeyOfWalletToQuery,
  addressOfToken,
  connection
) => {
  try {
    if (!publicKeyOfWalletToQuery) {
      throw new Error("No wallet for query!");
    }
    const accounts = await getTokenAccounts(
      publicKeyOfWalletToQuery,
      connection
    );
    const targetAccount = accounts.find((account) => {
      const parsedAccountInfo = account.account.data;
      if (parsedAccountInfo instanceof Buffer) {
        console.log("parsedAccountInfo is a buffer");
        return false; // Skip this account
      }
      const mintAddress = parsedAccountInfo["parsed"]["info"]["mint"];
      if (mintAddress === addressOfToken) {
        console.log(mintAddress);
        return true; // found the account
      }
      return false; // Skip this account
    });
    if (!targetAccount) {
      return 0;
    }
    if (targetAccount.account.data instanceof Buffer) {
      throw new Error("targetAccount is a buffer");
    }
    const tokenBalance =
      targetAccount.account.data["parsed"]["info"]["tokenAmount"]["uiAmount"];
    return tokenBalance;
  } catch (error) {
    throw new Error(error);
  }
};

async function getTokenAccounts(wallet, solanaConnection) {
  const filters = [
    {
      dataSize: 165,
    },
    {
      memcmp: { offset: 32, bytes: wallet },
    },
  ];
  const token_program_id = new PublicKey(SOLANA_TOKENPROGRAM_ID);
  const accounts = await solanaConnection.getParsedProgramAccounts(
    token_program_id,
    { filters: filters }
  );
  return accounts;
}
/**
 * Gets amount of solana in wallet
 * @param {string} publicAddress
 * @param {object} connection
 * @returns {Promise<number>} amountOfSolana
 */
const getSOLBalance = async (publicAddress, connection) => {
  try {
    const balance = await connection.getBalance(new PublicKey(publicAddress));
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    throw new Error(error);
  }
};
/**
 * Gets token name
 * @param {string} addressOfToken
 * @returns Promise<string>
 */
const getTokenName = async (tokenAddress) => {
  const tokenList = await fetch("https://token.jup.ag/all");
  const tokenListjson = await tokenList.json();
  const targetToken = tokenListjson.find((token) => {
    return token.address === tokenAddress;
  });
  if (!targetToken) {
    return "";
  }
  return targetToken.name.toString();
};
/**
 * Gets token decimals
 * @param {string} addressOfToken
 * @returns Promise<integer>
 */
const getTokenDecimals = async (tokenAddress) => {
  const tokenList = await fetch("https://token.jup.ag/all");
  const tokenListjson = await tokenList.json();
  const targetToken = tokenListjson.find((token) => {
    return token.address === tokenAddress;
  });
  if (!targetToken) {
    return -1;
  }
  return targetToken.decimals;
};
// const mockJupAddress = "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN";
// getBalanceOfToken(process.env.Main_PUBLIC_KEY, mockJupAddress, connection).then(
//   (balance) => {
//     console.log(balance);
//   }
// );

// getSOLBalance(process.env.Main_PUBLIC_KEY, connection).then((balance) => {
//   console.log(balance);
// });

module.exports = {
  getBalanceOfToken,
  getTokenAccounts,
  getSOLBalance,
  getTokenName,
  getTokenDecimals,
};
