from brownie import (
    DaoRegister,
    Dao,
    DaoWithSign,
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
from ..upgrade.deploy_upgradeable_beacon import (
    deploy_upgradeable_beacon,
)
from ..utils.file_functions import (
    update_address,
    read_address
)
from ..utils.helpful_scripts import (
    get_account,
    encode_function_data

)

name = 'Relation Dao Register'
symbol = 'SBT'
baseURI = ''
schemaURI = 'ar://7mRfawDArdDEcoHpiFkmrURYlMSkREwDnK3wYzZ7-x4'
class_ = ["Contract"]
predicate_ = [["daoContract", 3]]

dao_with_sign_name = "Relation Dao With Sign"

dao_register_proxy_name = "DaoRegister_TransparentUpgradeableProxy"
dao_beacon_name = "Dao_UpgradeableBeacon"
dao_with_sign_proxy_name = "DaoWithSign_UpgradeableBeacon"

load_dotenv()


def deploy_dao():
    account = get_account()
    print("====> use the address :{} to deploy Dao... ".format(account))
    dao = Dao.deploy(
        {"from": account},
        publish_source=config["networks"][network.show_active()].get(
            "verify", False),
    )
    update_address("Dao", dao)
    return dao


def deploy_dao_register():
    account = get_account()
    print("====> use the address :{} to deploy DaoRegister... ".format(account))
    dao_register = DaoRegister.deploy(
        {"from": account},
        publish_source=config["networks"][network.show_active()].get(
            "verify", False),
    )
    update_address("DaoRegister", dao_register)
    return dao_register


def deploy_dao_with_sign():
    account = get_account()
    print("====> use the address :{} to deploy DaoWithSign... ".format(account))
    dao_with_sign = DaoWithSign.deploy(
        {"from": account},
        publish_source=config["networks"][network.show_active()].get(
            "verify", False),
    )
    update_address("DaoWithSign", dao_with_sign)
    return dao_with_sign


def set_dao_impl():
    account = get_account()
    dao = deploy_dao()
    dao_beacon = deploy_upgradeable_beacon(dao, dao_beacon_name)

    dao_register = read_address(dao_register_proxy_name, DaoRegister)
    dao_register.setDaoImpl(dao_beacon, {"from": account})


def set_dao_verify_contract():
    account = get_account()
    proxy_admin = get_admin()
    dao_with_sign = deploy_dao_with_sign()
    init_data = encode_function_data(dao_with_sign.initialize,
                                     dao_with_sign_name
                                     )
    dao_with_sign_proxy = deploy_transparentUpgradeableProxy(dao_with_sign, proxy_admin, init_data,
                                                             dao_with_sign_proxy_name)

    dao_register = read_address(dao_register_proxy_name, DaoRegister)
    dao_register.setDaoVerifyContract(dao_with_sign_proxy, {"from": account})


def deploy_follow_register_fully():
    account = get_account()
    proxy_admin = get_admin()
    logic_address = deploy_dao_register()
    init_data = encode_function_data(logic_address.initialize,
                                     account,
                                     name,
                                     symbol,
                                     baseURI,
                                     schemaURI,
                                     class_,
                                     predicate_
                                     )
    deploy_transparentUpgradeableProxy(logic_address, proxy_admin, init_data, dao_register_proxy_name)
    set_dao_impl()
    set_dao_verify_contract()


def upgrade():
    account = get_account()
    logic_address = deploy_dao_register()
    proxy_admin = get_admin()
    proxy_address = get_proxy_address(dao_register_proxy_name)
    proxy_admin.upgrade(proxy_address, logic_address, {"from": account})
    print("===> DaoRegister has upgrade successfully!")


def call_dao_register():
    dao_register = read_address(dao_register_proxy_name, DaoRegister)
    owner = dao_register.owner()
    name_from_contract = dao_register.name()
    dao_impl_from_contract = dao_register.followImpl()
    print("===> DaoRegister has deployed successfully!\n\t owner:{}\n\t name:{}\n\t followImpl:{}\n\t".format(owner,
                                                                                                              name_from_contract,
                                                                                                              dao_impl_from_contract))


def create_dao(dao_name):
    account = get_account()
    dao_register = read_address(dao_register_proxy_name, DaoRegister)
    dao_register.deployDaoContract(account, dao_name, {"from": account})
    print("===> {} has created a dao".format(account))


def get_dao_list():
    account = get_account()
    dao_register = read_address(dao_register_proxy_name, DaoRegister)
    balance = dao_register.balanceOf(account)
    print("===>{} balance is :{}".format(account, balance))
    for i in range(0, balance):
        token_id = dao_register.tokenOfOwnerByIndex(account, i)
        dao = dao_register.daoOf(token_id)
        print("===> {} has created a dao, token_id = {} contract_address={}".format(account, token_id, dao))


def main():
    deploy_follow_register_fully()
    upgrade()

    # Test
    # create_dao("test-dao")
    # get_dao_list()
