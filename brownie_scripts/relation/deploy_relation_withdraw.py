from brownie import (
    SoulProfileWithdraw,
    config,
    network,
)
from dotenv import load_dotenv

from ..utils.file_functions import (
    read_address,
    update_address
)
from ..utils.helpful_scripts import (
    get_account

)

load_dotenv()


def deploy_relation_withdraw(minter, name):
    account = get_account()
    print("====> use the address :{} to deploy... ".format(account))
    relation_withdraw = SoulProfileWithdraw.deploy(minter, name,
                                                {"from": account},
                                                publish_source=config["networks"][network.show_active()].get(
                                                    "verify", False),
                                                )
    update_address("SoulProfileWithdraw", relation_withdraw)
    return relation_withdraw


def set_minter(minter):
    account = get_account()

    relation_withdraw = read_address("SoulProfileWithdraw", SoulProfileWithdraw)
    relation_withdraw.setMinter(minter, True,
                                {"from": account}
                                )


def main():
    minter = "0x4E19FCD5848934Bc58d009Ca6e7fB051329CFFFF"
    name = ".soul profile withdraw"
    deploy_relation_withdraw(minter, name)
