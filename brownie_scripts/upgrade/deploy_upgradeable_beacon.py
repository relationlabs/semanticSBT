from brownie import (
    UpgradeableBeacon,
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


def deploy_upgradeable_beacon(logic_address, beacon_name):
    account = get_account()
    print("====> use the address :{} to deploy {}... ".format(account, beacon_name))
    upgradeable_beacon = UpgradeableBeacon.deploy(
        logic_address,
        {"from": account},
        publish_source=config["networks"][network.show_active()].get(
            "verify", False),
    )
    update_address(beacon_name, upgradeable_beacon)
    return upgradeable_beacon


def get_proxy_address(name):
    read_address(name, UpgradeableBeacon)
    return read_address(name, UpgradeableBeacon)
