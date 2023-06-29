from brownie import (
    TransparentUpgradeableProxy,
    config,
    network,
)
from dotenv import load_dotenv

from ..utils.file_functions import (
    update_address,
    read_address
)
from ..utils.helpful_scripts import (
    get_account

)

load_dotenv()


def deploy_transparentUpgradeableProxy(logic_address, proxy_admin, data, name):
    account = get_account()
    print("====> use the address :{} to deploy {} ... ".format(account, name))
    transparent_upgradeable_proxy = TransparentUpgradeableProxy.deploy(
        logic_address,
        proxy_admin,
        data,
        {"from": account},
        publish_source=config["networks"][network.show_active()].get(
            "verify", False),
    )

    update_address(name, transparent_upgradeable_proxy)
    return transparent_upgradeable_proxy


def get_proxy_address(name):
    read_address(name, TransparentUpgradeableProxy)
    return read_address(name, TransparentUpgradeableProxy)

