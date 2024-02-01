import web3
import constant as c
from uniswap import Uniswap
from web3.middleware import geth_poa_middleware


class tradeBot:
    
    # init of out bot
    def __init__(self, address, private_key, uniswap_ver, network, token0, token1, fee=None):
        self.address = address
        self.privateKey = private_key
        self.ver = uniswap_ver
        self.network = network
        self.token0 = token0[network]
        self.token1 = token1[network]
        self.fee = fee
        
        # trying to connect to the ethereum nodes
        self.w3 = web3.Web3(web3.HTTPProvider(c.RPC[network]))
        self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)
        self.uniswap = Uniswap(address=address, private_key=private_key,
                               version=uniswap_ver, provider=c.RPC[network],
                               web3=self.w3)
    def swap_token_helper(self, swapPortion):
        # swap swapPortion% of token0 for token1
        
        amt = self.uniswap.get_token_balance(self.token0['address']) / 10 ** self.token0['decimals']
        print(f'My Wallet address {self.address}')
        print(f'Balance of {self.token0["symbol"]}: {amt}')
        swapPortion /= 100
        amt = int(amt * 10 ** self.token0["decimals"] * swapPortion)
        self.uniswap.make_trade(self.token0['address'], self.token1['address'], amt, 
                                recipient=None, fee=self.fee, slippage=None, fee_on_transfer=False)
        print(f'Swapped {amt / 10 ** self.token0["decimals"]} {self.token0["symbol"]} for {self.token1["symbol"]}.')

