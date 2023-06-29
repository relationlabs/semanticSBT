from brownie import (
    network,
    config,
    accounts,
)
import eth_utils

LOCAL_BLOCKCHAIN_ENVIRONMENTS = ["development", "ganache-local"]


def get_account(index=None, id=None):
    if index:
        return accounts[index]
    if id:
        return accounts.load(id)
    if network.show_active() in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        return accounts[0]
    active_account = config["networks"][network.show_active()
                                        ]["active_account"]
    return accounts.add(config["wallets"][active_account])


def encode_function_data(initializer=None, *args):
    if not initializer:
        return eth_utils.to_bytes(hexstr="0x")
    return initializer.encode_input(*args)


def upgrade(
    account,
    proxy,
    new_implementation_address,
    proxy_admin_contract=None,
    initializer=None,
    *args,
):
    transaction = None
    if proxy_admin_contract:
        if initializer:
            encode_function_call = encode_function_data(initializer, *args)
            transaction = proxy_admin_contract.upgradeAndCall(
                proxy.address,
                new_implementation_address,
                encode_function_call,
                {"from": account},
            )
        else:
            transaction = proxy_admin_contract.upgrade(
                proxy.address, new_implementation_address, {"from": account}
            )
    else:
        if initializer:
            encode_function_call = encode_function_data(initializer, *args)
            transaction = proxy_admin_contract.upgradeToAndCall(
                new_implementation_address,
                encode_function_call,
                {"from": account},
            )
        else:
            transaction = proxy_admin_contract.upgradeTo(
                new_implementation_address, {"from": account}
            )
    return transaction
