from brownie import (
    FollowRegisterLogic,
    config,
    network,
)
from dotenv import load_dotenv

from ..utils.file_functions import update_address
from ..utils.helpful_scripts import (
    get_account,

)

load_dotenv()


def deploy_follow_register_logic():
    account = get_account()
    print(account)
    print(config["networks"][network.show_active()])
    follow_register_logic = FollowRegisterLogic.deploy(
        {"from": account},
        publish_source=config["networks"][network.show_active()].get(
            "verify", False),
    )

    update_address("FollowRegisterLogic", follow_register_logic)
    return follow_register_logic


def main():

    deploy_follow_register_logic()
