from brownie import (
    SemanticSBTLogicUpgradeable,
    config,
    network,
)
from dotenv import load_dotenv

from ..utils.file_functions import update_address
from ..utils.helpful_scripts import (
    get_account,

)

load_dotenv()


def deploy_SemanticSBTUpgradeableLogic():
    account = get_account()
    print(account)
    print(config["networks"][network.show_active()])
    semanticSBTLogicUpgradeable = SemanticSBTLogicUpgradeable.deploy(
        {"from": account},
        publish_source=config["networks"][network.show_active()].get(
            "verify", False),
    )

    update_address("SemanticSBTLogicUpgradeable", semanticSBTLogicUpgradeable)
    return semanticSBTLogicUpgradeable


def main():
    deploy_SemanticSBTUpgradeableLogic()
