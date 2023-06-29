from brownie import (
    NameServiceLogic,
    config,
    network,
)
from dotenv import load_dotenv

from ..utils.file_functions import update_address
from ..utils.helpful_scripts import (
    get_account,

)

load_dotenv()


def deploy_nameServiceLogic():
    account = get_account()
    print(account)
    print(config["networks"][network.show_active()])
    nameServiceLogic = NameServiceLogic.deploy(
        {"from": account},
        publish_source=config["networks"][network.show_active()].get(
            "verify", False),
    )

    update_address("NameServiceLogic", nameServiceLogic)
    return nameServiceLogic


def main():
    # Solely Deploy

    deploy_nameServiceLogic()
