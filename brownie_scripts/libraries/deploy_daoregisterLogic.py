from brownie import (
    DaoRegisterLogic,
    config,
    network,
)
from dotenv import load_dotenv

from ..utils.file_functions import update_address
from ..utils.helpful_scripts import (
    get_account,

)

load_dotenv()


def deploy_dao_register_logic():
    account = get_account()
    print(account)
    print(config["networks"][network.show_active()])
    dao_register_logic = DaoRegisterLogic.deploy(
        {"from": account},
        publish_source=config["networks"][network.show_active()].get(
            "verify", False),
    )

    update_address("DaoRegisterLogic", dao_register_logic)
    return dao_register_logic


def main():
    # Solely Deploy

    deploy_dao_register_logic()
