import csv
from os import environ
from web3 import Web3
from web3.exceptions import TransactionNotFound, TimeExhausted
from dotenv import load_dotenv
from hdwallet import BIP44HDWallet
from hdwallet.cryptocurrencies import EthereumMainnet
from hdwallet.derivations import BIP44Derivation
from time import sleep


# Read from .env
load_dotenv()

# web3 providers and network details
INFURA_PID = environ['INFURA_PID']
WEB3_PROVIDER_URI = f'https://mainnet.infura.io/v3/{INFURA_PID}'
w3 = Web3(Web3.HTTPProvider(WEB3_PROVIDER_URI))

def shorten(s):
    return f'{s[0:6]}...{s[-4:]}'

def get_eth_account():
    bip44_hdwallet = BIP44HDWallet(cryptocurrency=EthereumMainnet)
    bip44_hdwallet.from_mnemonic(
        mnemonic=environ['MNEMONIC'], language='english', passphrase=None
    )
    bip44_hdwallet.clean_derivation()
    bip44_derivation = BIP44Derivation(
        cryptocurrency=EthereumMainnet, account=0, change=False, address=0
    )
    bip44_hdwallet.from_path(path=bip44_derivation)
    public_address = bip44_hdwallet.address()
    private_key = '0x' + bip44_hdwallet.private_key()
    bip44_hdwallet.clean_derivation()
    return (public_address, private_key)


with open('export-0xea2dc6f116a4c3d6a15f06b4e8ad582a07c3dd9c.csv', mode='r')as file:
    totals = {'eth_wei': 0, 'eth': 0}
    csv_file = csv.DictReader(file)
    _m = '0xe366c9ca'
    for lines in csv_file:
        if lines['Method'] == _m and lines['Status'] == '':
            tx_hash = lines["Txhash"]
            if tx_hash in open('sent.log').read():
                continue
            amt_eth = float(lines["Value_IN(ETH)"])
            amt_wei = w3.toWei(amt_eth, 'ether')
            acc = get_eth_account()
            from_privkey = acc[1]
            from_address = w3.toChecksumAddress(acc[0])
            eth_account = w3.eth.account.from_key(from_privkey)
            w3.defaultAccount = from_address
            to_address = w3.toChecksumAddress(lines['From'])
            if to_address not in totals:
                totals[to_address] = 0
            totals[to_address] += amt_wei
            gas = 21000
            # nonce = w3.eth.get_transaction_count(from_address)
            nonce = 0
            # gas_price = w3.eth.gas_price
            gas_price = w3.toWei(80, 'gwei')
            gas_price_gwei = w3.fromWei(gas_price, 'gwei')
            tx_dict = {
                'to': to_address,
                'from': from_address,
                'gas': gas,
                'gasPrice': gas_price,
                'value': amt_wei,
                'nonce': nonce,
                'chainId': 1
            }
            print(f'[+] Refunding {amt_eth} ETH to {shorten(to_address)} at {gas_price_gwei} gwei and nonce {nonce} for mint tx {shorten(tx_hash)}')
            # break
            # sleep(1)
            # signed_tx = eth_account.sign_transaction(tx_dict)
            # res = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            # refund_hash = res.hex()
            # with open('sent.log', 'a') as f:
            #     f.write(f'{tx_hash} {refund_hash}\n')
            # try:
            #     sleep(30)
            #     tx_receipt = w3.eth.wait_for_transaction_receipt(refund_hash, timeout=600, poll_latency=15)
            #     tx_status = tx_receipt['status'] == 1
            #     if not tx_status:
            #         print(f'[ethereum_tx] Tx {refund_hash} failed')
            #         raise Exception('TX failed')
            #     print(f'[+] Payout details updated for tx {eth_tx.tx_hash}')
            # except TransactionNotFound:
            #     print('[!] That transaction does not exist')
            #     raise Exception('TX failed')
            # except TimeExhausted:
            #     print('[!] Time has exhausted on this send')
            #     raise Exception('TX failed')
            # except Exception as e:
            #     print(f'[!] {e}')
            #     raise Exception('TX failed')

    for i in totals:
        totals['eth_wei'] += totals[i]
        totals[i] = float(w3.fromWei(totals[i], 'ether'))

    totals['eth'] = w3.fromWei(totals['eth_wei'], 'ether')
    print(totals['eth'])
