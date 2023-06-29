from brownie import (
    NameService,
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

name = 'Relation Name Service Template'
symbol = 'SBT'
schemaURI = 'ar://PsqAxxDYdxfk4iYa4UpPam5vm8XaEyKco3rzYwZJ_4E'
class_ = ["Name"]
predicate_ = [["hold", 3], ["resolved", 3], ["profileURI", 1]]
suffix = ".soul"

name_service_proxy_name = "NameService_TransparentUpgradeableProxy"

load_dotenv()


def deploy_name_service():
    account = get_account()
    print("====> use the address :{} to deploy... ".format(account))
    name_service = NameService.deploy(
        {"from": account},
        publish_source=config["networks"][network.show_active()].get(
            "verify", False),
    )
    update_address("NameService", name_service)
    return name_service


def deploy_name_service_fully():
    proxy_admin = get_admin()
    logic_address = deploy_name_service()
    init_data = encode_function_data(logic_address.initialize,
                                     suffix,
                                     name,
                                     symbol,
                                     schemaURI,
                                     class_,
                                     predicate_
                                     )
    deploy_transparentUpgradeableProxy(logic_address, proxy_admin, init_data, name_service_proxy_name)


def upgrade():
    account = get_account()
    logic_address = deploy_name_service()
    proxy_admin = get_admin()
    proxy_address = get_proxy_address(name_service_proxy_name)
    proxy_admin.upgrade(proxy_address, logic_address, {"from": account})
    print("===> NameService has upgrade successfully!")


def call_name_service():
    name_service = read_address(name_service_proxy_name, NameService)
    owner = name_service.owner()
    name_from_contract = name_service.name()
    suffix_from_contract = name_service.suffix()
    print("===> NameService has deployed successfully!\n\t owner:{}\n\t name:{}\n\t suffix:{}".format(owner,
                                                                                                      name_from_contract,
                                                                                                      suffix_from_contract))


def main():
    deploy_name_service_fully()
    upgrade()
    call_name_service()