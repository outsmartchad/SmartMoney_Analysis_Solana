
import requests
import time
import web3
import pandas as pd
from datetime import datetime, timedelta
import hashlib
import hmac
import base64
import random
import json
import multiprocessing
import concurrent.futures
import traceback
import json
from tradingBot import tradeBot
from wallets import wallet1
import constant as c
from web3.exceptions import ContractLogicError  

""" Golbal varibles """
api_key_list = ['E2IF43F4PF2MHH6B787XTFRMH59SEA2YMA','CBDCC17UVPM9M9TY12RRJZAVXZUNPEE4Z8','5UXWW6RYI318IZZF9Z7VQD1HED7J6HAH9D','BJJKDZ5R2KFBZW4GV1MXEPRRU1EJVN2K1G', 'PJ8X4ADB1VBVAQNHTXW13J7TCB46X7THT7', 'F2GDTZ2N53MDKFZ8CSGQR4Y2AHZZTJZH6M']
base_url = 'https://api.etherscan.io/api'
X_BLOBR_KEY_list = ['l2kZLXb5y159jtmORsUpZsrqmWR1hPNx','qs3JGw3zrwunLqpOupculHLc0qCi5VCY', 'EElaWmMD94plCowVHeYXRRkqb27WqyXH', 'ynbnBGGvGxNKhMuYGA6WrPt00NXQNX4E','19dFd6h5mFQphREHdn8aqWsImon5XaxE','SJFWcTI35dXdYVg8MCGrJW1Fr53BiEQ5']
dex_tool_base_url = 'https://open-api.dextools.io/free'
# https://api.telegram.org/bot6304394298:AAE9018LlvLtflXz_Cpg9lzF_dajekwDna, you can get it when requesting the bot to send msg 
root_url = 'https://api.telegram.org/bot:'
chatId = '' # this is needed, you have to generate it by yourself
msg = ""
send_path = f"{root_url}/sendMessage?chat_id={chatId}&text="
dex_tool_path = "https://www.dextools.io/app/en/ether/pair-explorer/"
env_obj = None
WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
"""                  """
def get_balance_of(contractAddress, decimals):
    bot = tradeBot(address=wallet1['address'], private_key=wallet1['private_key'], 
                    uniswap_ver=3, network='mainnet', token0=c.WETH, token1=c.DAI)
    with open("./tokens.json", 'r') as f:
        tokens = json.load(f)
    amt = bot.uniswap.get_token_balance(contractAddress) / 10 ** decimals
    print(f'Balance of {tokens[contractAddress]["symbol"]}: {amt}')
    return amt

def buy(contractAddress, symbol, decimals):
    # check if already buy the token
    try:
        if get_balance_of(contractAddress=contractAddress, decimals=decimals) > 0: return
        with open("./tokens.json", "r") as f:
            tokens = json.load(f)
        
        # the token what we want to swap
        tokens[contractAddress] = {
            'mainnet': {
            'symbol': symbol,
            'address': web3.to_checksum_address(
                contractAddress
                ),
            'decimals': decimals
            }
        }
        # buy it with 10 ~ 15%
        percentage = random.randint(10, 15)
        Bot = tradeBot(address=wallet1['address'], private_key=wallet1['private_key'], 
                    uniswap_ver=3, network=c.RPC['mainnet'], token0=c.WETH, token1=tokens[contractAddress])
        # start transaction
        Bot.swap_token_helper(swapPortion=percentage)
    except ContractLogicError as e:
    # 處理ContractLogicError
        print("An error occurred:", e)
        print("Error message:", f'{Bot.token0["symbol"]} is not engough for swapping.')
    with open("./tokens.json", 'w') as f:
        json.dump(tokens, f)
        
def sell(contractAddress):
    with open("./tokens.json", "r") as f:
        tokens = json.load(f)
    try:
        if contractAddress not in tokens: return 
        Bot = tradeBot(address=wallet1['address'], private_key=wallet1['private_key'], 
                    uniswap_ver=3, network=c.RPC['mainnet'], token0=tokens[contractAddress], token1=c.WETH)
        Bot.swap_token_helper(swapPortion=100)
    except ContractLogicError as e:
    # 處理ContractLogicError
        print("An error occurred:", e)
        print("Error message:", f'{Bot.token0["symbol"]} is not engough for swapping.')
    del tokens[contractAddress]

def convertToUTCTime(time):
    utc_time = datetime.utcfromtimestamp(int(time))
    utc_time_plus_8 = utc_time + timedelta(hours=8)
    date_str = utc_time_plus_8.strftime('%Y-%m-%d %H:%M:%S')
    return date_str
def request_block(timestamp):
    params = {
    'module': 'block',
    'action': 'getblocknobytime',
    'timestamp': timestamp,
    'closest': 'before',
    'apikey': '',
    }
    id = random.randint(1, 9633)
    id = id % len(api_key_list)
    params['apikey'] = api_key_list[id]
    response = requests.get(url=base_url, params=params)
    return response.json()
def request_erc_tx(contractaddress, address, start, end):
    params = {
    'module': 'account',
    'action': 'tokentx',
    'address': address,
    'contractaddress': contractaddress,
    'startblock': start,
    'endblock': end,
    'apikey': '',
    'page': 1,
    'offset': 6,
    'sort': 'asc'
    }
    id = random.randint(1, 9633)
    id = id % len(api_key_list)
    params['apikey'] = api_key_list[id]
    response = requests.get(url=base_url, params=params)
    return response.json()
def request_eth_price():
    params = {
        'module': 'stats',
        'action': 'ethprice',
        'apikey': '',
    }
    id = random.randint(1, 9633)
    id = id % len(api_key_list)
    params['apikey'] = api_key_list[id]
    response = requests.get(url=base_url, params=params)
    return response.json()

def get_cur_timestamp():
        # Get the current time in UTC+8
    current_time = datetime.now()
    # Calculate the start time for the last 60 minutes
    start_time = current_time

    # Convert the start time to a timestamp in milliseconds
    active_timeStamp = int(start_time.timestamp())*1000

    utc_time = datetime.utcfromtimestamp(active_timeStamp/1000) + timedelta(hours=8)
    date_str = utc_time.strftime('%Y-%m-%d %H:%M:%S')
    print(date_str)
    return int(active_timeStamp/1000)
def get_last_5_min_timestamp(timeStamp):
    timeStamp = float(timeStamp)
    utc_time = datetime.utcfromtimestamp(timeStamp) - timedelta(minutes=2)
    res = utc_time
    utc_time = utc_time + timedelta(hours=8)
    date_str = utc_time.strftime('%Y-%m-%d %H:%M:%S')
    print(date_str)
    return int(res.timestamp())
def get_token_price(address):
    chain = 'ether'
    url = f'/v2/token/{chain}/{address}/price'
    # getting the token's price
    headers = {
    "X-BLOBR-KEY": ""
    }
    id = random.randint(1, 9633)
    id = id % len(X_BLOBR_KEY_list)
    headers['X-BLOBR-KEY'] = X_BLOBR_KEY_list[id]
    response = requests.get(url=dex_tool_base_url+url, headers=headers)
    if response.status_code != 200: return get_token_price(address)
    data = response.json()
    return data

def get_cur_block():
    curTimeStamp = get_cur_timestamp()
    data = request_block(curTimeStamp)
    return data['result']
def get_blockByTimestamp(timestamp):
    data = request_block(timestamp)
    return int(data['result'])

def convertToEth(token_value, decimal, contractAddress):
    eth_value = float(token_value) / (10 ** int(decimal))
    try:
        price = float(get_token_price(contractAddress)['data']['price'])
        eth_value = eth_value * price / get_eth_price()
    except :
        print("cannot find the price")
        return convertToEth(token_value, decimal, contractAddress)
    finally:
        return eth_value 

#%%
def get_eth_price():
    price = request_eth_price()
    return float(price['result']['ethusd'])

def main_job(address, tx_hist_list):
    try:
        print(f'Running address {address}')
        curTimestamp = get_cur_timestamp()
        last5Timestamp = get_last_5_min_timestamp(curTimestamp)
        start = get_blockByTimestamp(last5Timestamp)
        end = get_blockByTimestamp(curTimestamp)
        print(start)
        print(end)

        # requesting
        data = request_erc_tx(contractaddress=None, address=address, start=start, end=end)
        if data['status'] != '1':
            return
        tx_arr = data['result']
        for tx in tx_arr:
            if tx['hash'] in tx_hist_list or int(tx['blockNumber']) < int(start):
                break
            tx_hist_list.append(tx['hash'])

            # computations, token value in terms of no. of eth
            eth_value = convertToEth(float(tx['value']), int(tx['tokenDecimal']), tx['contractAddress'])

            if tx['from'] == address:
                # sellout新賣出
                sellpos = get_token_price(tx["contractAddress"])["data"]["price"]
                msg = f'🔴 Time: {convertToUTCTime(tx["timeStamp"])} 新賣出\n\n 項目：{tx["tokenSymbol"]} \n合約地址： {tx["contractAddress"]} \n金額：{eth_value}ETH \n價格：${sellpos} \n錢包：{address}'
                sell(tx["contractAddress"])
                requests.get(send_path+f'MetaMask wallet: \n'+ +get_balance_of(contractAddress=WETH, decimals=18))
            elif tx['to'] == address:
                # buyin 新買入
                buypos = get_token_price(tx["contractAddress"])["data"]["price"]
                msg = f'🟢 Time: {convertToUTCTime(tx["timeStamp"])} 新買入\n\n 項目：{tx["tokenSymbol"]} \n合約地址： {tx["contractAddress"]} \n金額：{eth_value}ETH \n價格：${buypos} \n錢包：{address}'
                buy(tx["contractAddress"], tx['tokenSymbol'], tx['tokenDecimal'])
            msg = msg + f"\n  🔗 {dex_tool_path+tx['contractAddress']}" 
            print(msg)
            if msg != None: requests.get(send_path+msg)
    except Exception as e:
        print(f'Error occurred while processing address {address}: {str(e)}')
        traceback.print_exc()
    newdf = pd.DataFrame(tx_hist_list)
    newdf.columns = ['tx']
    newdf.to_csv("./txHist.csv", index=False)
def process_address(address):
    df = pd.read_csv("./txHist.csv")
    tx_list = df['tx'].to_list()
    return main_job(address, tx_list)

def main(wallet_list):
    start = time.perf_counter()

    with concurrent.futures.ProcessPoolExecutor() as executor:
        results = executor.map(process_address, wallet_list)
        for result in results:
            if result is not None:
                print(result)

    finish = time.perf_counter()
    print(f'Finished in {round(finish-start, 2)} second(s)')

if __name__ == '__main__':
    df = pd.read_csv("./smart_ones.csv")
    wallet_list = df['altcoin_smartWallet'].to_list()
    while True:
    	main(wallet_list)

