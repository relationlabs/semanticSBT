from brownie import (
    ProxyAdmin,
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


def deploy_proxy_admin():
    account = get_account()
    print("====> use the address :{} to deploy ProxyAdmin... ".format(account))
    proxy_admin = ProxyAdmin.deploy(
        {"from": account},
        publish_source=config["networks"][network.show_active()].get(
            "verify", False),
    )
    update_address("ProxyAdmin", proxy_admin)
    return proxy_admin


def get_admin():
    read_address("ProxyAdmin", ProxyAdmin)
    return read_address("ProxyAdmin", ProxyAdmin)


def main():
    deploy_proxy_admin()
