import web3
import requests
from tradingBot import tradeBot
from wallets import wallet1
import constant as c
from web3.exceptions import ContractLogicError  
import json
bot = None
def main():
    # just convert ETH to WETH, 
    
    # when find a chance, create a bot to convert WETH to other erc20 token 
    try:
        
        if bot.w3.is_connected():
            bot.swap_token_helper(swapPortion=100)
        
    except ContractLogicError as e:
    # 處理ContractLogicError
        print("An error occurred:", e)
        print("Error message:", f'{bot.token0["symbol"]} is not engough for swapping.')


def get_balance_of(contractAddress):
    with open("./tokens.json", 'r') as f:
        tokens = json.load(f)
    
    amt = bot.uniswap.get_token_balance(contractAddress) / 10 ** tokens[contractAddress]['decimals']
    print(f'Balance of {tokens[contractAddress]["symbol"]}: {amt}')
    return amt
if __name__ == '__main__':

    bot = tradeBot(address=wallet1['address'], private_key=wallet1['private_key'], 
                    uniswap_ver=3, network='mainnet', token0=c.WETH, token1=c.DAI)
    
    
    print(get_balance_of('0xdAC17F958D2ee523a2206206994597C13D831ec7')==0)