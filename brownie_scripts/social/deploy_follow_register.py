from brownie import (
    Follow,
    FollowRegister,
    FollowWithSign,
    config,
    network,
    Contract
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

name = 'Relation Follow Register'
symbol = 'SBT'
baseURI = ''
schemaURI = 'ar://auPfoCDBtJ3RJ_WyUqV9O7GAARDzkUT4TSuj9uuax-0'
class_ = ["Contract"]
predicate_ = [["followContract", 3]]

follow_with_sign_name = "Relation Follow With Sign"

follow_register_proxy_name = "FollowRegister_TransparentUpgradeableProxy"
follow_beacon_name = "Follow_UpgradeableBeacon"
follow_with_sign_proxy_name = "FollowWithSign_TransparentUpgradeableProxy"

load_dotenv()


def deploy_follow():
    account = get_account()
    print("====> use the address :{} to deploy Follow... ".format(account))
    follow = Follow.deploy(
        {"from": account},
        publish_source=config["networks"][network.show_active()].get(
            "verify", False),
    )
    update_address("Follow", follow)
    return follow


def deploy_follow_register():
    account = get_account()
    print("====> use the address :{} to deploy FollowRegister... ".format(account))
    follow_register = FollowRegister.deploy(
        {"from": account},
        publish_source=config["networks"][network.show_active()].get(
            "verify", False),
    )
    update_address("FollowRegister", follow_register)
    return follow_register


def deploy_follow_with_sign():
    account = get_account()
    print("====> use the address :{} to deploy FollowWithSign... ".format(account))
    follow_with_sign = FollowWithSign.deploy(
        {"from": account},
        publish_source=config["networks"][network.show_active()].get(
            "verify", False),
    )
    update_address("FollowWithSign", follow_with_sign)
    return follow_with_sign


def set_follow_impl():
    account = get_account()
    follow = deploy_follow()
    follow_beacon = deploy_upgradeable_beacon(follow, follow_beacon_name)

    follow_register = read_address(follow_register_proxy_name, FollowRegister)
    follow_register.setFollowImpl(follow_beacon,
                                  {"from": account}
                                  )


def set_follow_verify_contract():
    account = get_account()
    proxy_admin = get_admin()
    follow_with_sign = deploy_follow_with_sign()

    init_data = encode_function_data(follow_with_sign.initialize,
                                     follow_with_sign_name
                                     )
    follow_with_sign_proxy = deploy_transparentUpgradeableProxy(follow_with_sign, proxy_admin, init_data,
                                                                follow_with_sign_proxy_name)
    follow_register = read_address(follow_register_proxy_name, FollowRegister)

    follow_register.setFollowVerifyContract(follow_with_sign_proxy,
                                            {"from": account}
                                            )


def deploy_follow_register_fully():
    account = get_account()
    proxy_admin = get_admin()
    logic_address = deploy_follow_register()
    init_data = encode_function_data(logic_address.initialize,
                                     account,
                                     name,
                                     symbol,
                                     baseURI,
                                     schemaURI,
                                     class_,
                                     predicate_
                                     )
    deploy_transparentUpgradeableProxy(logic_address, proxy_admin, init_data, follow_register_proxy_name)
    set_follow_impl()
    set_follow_verify_contract()


def upgrade():
    account = get_account()
    logic_address = deploy_follow_register()
    proxy_admin = get_admin()
    proxy_address = get_proxy_address(follow_register_proxy_name)
    proxy_admin.upgrade(proxy_address, logic_address, {"from": account})
    print("===> FollowRegister has upgrade successfully!")


def call_follow_register():
    follow_register = read_address(follow_register_proxy_name, FollowRegister)
    owner = follow_register.owner()
    name_from_contract = follow_register.name()
    follow_impl_from_contract = follow_register.followImpl()
    print("===> FollowRegister has deployed successfully!\n\t owner:{}\n\t name:{}\n\t followImpl:{}\n\t".format(owner,
                                                                                                                 name_from_contract,
                                                                                                                 follow_impl_from_contract))


def create_follow_contract(to):
    account = get_account()
    follow_register = read_address(follow_register_proxy_name, FollowRegister)
    follow_register.deployFollowContract(to,
                                         {"from": account}
                                         )
    follow_contract = follow_register.ownedFollowContract(to)
    print("===> {} has deployed follow contract successfully!The contract address is :{}".format(to, follow_contract))


def follow(to_follow):
    account = get_account()
    follow_register = read_address(follow_register_proxy_name, FollowRegister)
    follow_contract = follow_register.ownedFollowContract(to_follow)
    follow = Contract.from_abi(
        "Follow",
        follow_contract,
        Follow.abi,
    )
    follow.follow({"from": account})
    is_following = follow.isFollowing(account)
    print("==> {} following {} : {}".format(account, to_follow, is_following))


def main():
    deploy_follow_register_fully()
    upgrade()

    call_follow_register()

    # Test
    # wallet_address = ""
    # create_follow_contract(wallet_address)
    # follow(wallet_address)
