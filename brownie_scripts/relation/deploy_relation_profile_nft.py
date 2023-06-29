from brownie import (
    RelationProfileNFT,
    config,
    network,
)
from dotenv import load_dotenv

from ..upgrade.deploy_proxyadmin import (
    get_admin
)
from ..upgrade.deploy_transparentupgradeableproxy import (
    get_proxy_address,
    deploy_transparentUpgradeableProxy
)
from ..utils.file_functions import (
    update_address,
    read_address
)
from ..utils.helpful_scripts import (
    get_account,
    encode_function_data

)

name = '.soul profile '
symbol = 'SOUL'
schemaURI = 'ar://PsqAxxDYdxfk4iYa4UpPam5vm8XaEyKco3rzYwZJ_4E'
class_ = ["Name"]
predicate_ = [["hold", 3], ["resolved", 3], ["profileURI", 1]]
suffix = ".soul"

proxy_name = "RelationProfileNFT_TransparentUpgradeableProxy"

load_dotenv()


def deploy_relation_profile_nft():
    account = get_account()
    print("====> use the address :{} to deploy... ".format(account))
    relation_profile_nft = RelationProfileNFT.deploy(
        {"from": account},
        publish_source=config["networks"][network.show_active()].get(
            "verify", False),
    )
    update_address("RelationProfileNFT", relation_profile_nft)
    return relation_profile_nft


def deploy_relation_profile_nft_fully():
    proxy_admin = get_admin()
    logic_address = deploy_relation_profile_nft()
    init_data = encode_function_data(logic_address.initialize,
                                     suffix,
                                     name,
                                     symbol,
                                     schemaURI,
                                     class_,
                                     predicate_
                                     )
    deploy_transparentUpgradeableProxy(logic_address, proxy_admin, init_data, proxy_name)


def upgrade():
    account = get_account()
    logic_address = deploy_relation_profile_nft()
    proxy_admin = get_admin()
    proxy_address = get_proxy_address(proxy_name)
    proxy_admin.upgrade(proxy_address, logic_address, {"from": account})
    print("===> RelationProfileNFT has upgrade successfully!")


def call_relation_profile_nft():
    relation_profile_nft = read_address(proxy_name, RelationProfileNFT)
    owner = relation_profile_nft.owner()
    name_from_contract = relation_profile_nft.name()
    suffix_from_contract = relation_profile_nft.suffix()
    print("===> RelationProfileNFT has deployed successfully!\n\t owner:{}\n\t name:{}\n\t suffix:{}".format(owner,
                                                                                                      name_from_contract,
                                                                                                      suffix_from_contract))


def main():
    deploy_relation_profile_nft_fully()
    upgrade()

    call_relation_profile_nft()

