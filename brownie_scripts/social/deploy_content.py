from brownie import (
    Content,
    ContentWithSign,
    config,
    network
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

name = 'Relation Content'
symbol = 'SBT'
baseURI = ''
schemaURI = 'ar://HENWTh3esXyAeLe1Yg_BrBOHhW-CcDQoU5inaAx-yNs'
class_ = []
predicate_ = [["publicContent", 1]]

content_with_sign_name = "Relation Content With Sign"

proxy_name = "Content_TransparentUpgradeableProxy"
content_with_sign_proxy_name = "ContentWithSign_TransparentUpgradeableProxy"

load_dotenv()


def deploy_content():
    account = get_account()
    print("====> use the address :{} to deploy Content... ".format(account))
    content = Content.deploy(
        {"from": account},
        publish_source=config["networks"][network.show_active()].get(
            "verify", False),
    )
    update_address("Content", content)
    return content


def deploy_content_with_sign():
    account = get_account()
    print("====> use the address :{} to deploy ContentWithSign... ".format(account))
    content_with_sign = ContentWithSign.deploy(
        {"from": account},
        publish_source=config["networks"][network.show_active()].get(
            "verify", False),
    )
    update_address("ContentWithSign", content_with_sign)
    return content_with_sign


def deploy_content_with_sign_proxy():
    proxy_admin = get_admin()
    content_with_sign = deploy_content_with_sign()

    init_data = encode_function_data(content_with_sign.initialize,
                                     content_with_sign_name
                                     )
    content_with_sign_proxy = deploy_transparentUpgradeableProxy(content_with_sign, proxy_admin, init_data,
                                                                 content_with_sign_proxy_name)
    return content_with_sign_proxy


def deploy_content_fully():
    account = get_account()
    proxy_admin = get_admin()
    logic_address = deploy_content()
    content_with_sign_proxy = deploy_content_with_sign_proxy()
    init_data = encode_function_data(logic_address.initialize,
                                     account,
                                     content_with_sign_proxy,
                                     name,
                                     symbol,
                                     baseURI,
                                     schemaURI,
                                     class_,
                                     predicate_
                                     )
    deploy_transparentUpgradeableProxy(logic_address, proxy_admin, init_data, proxy_name)


def upgrade():
    account = get_account()
    logic_address = deploy_content()
    proxy_admin = get_admin()
    proxy_address = get_proxy_address(proxy_name)
    proxy_admin.upgrade(proxy_address, logic_address, {"from": account})
    print("===> Content has upgrade successfully!")


def call_content():
    content = read_address(proxy_name, Content)
    owner = content.owner()
    name_from_contract = content.name()
    print("===> Content has deployed successfully!\n\t owner:{}\n\t name:{}\n\t ".format(owner,
                                                                                                name_from_contract))


def post(post_content):
    account = get_account()
    content = read_address(proxy_name, Content)
    content.post(post_content, {"from": account})
    total_supply = content.totalSupply()
    content_from_contract = content.contentOf(total_supply)
    print("==> token_id={} content:{}".format(total_supply, content_from_contract))


def main():
    deploy_content_fully()
    # upgrade()
    call_content()

    # Test
    # post("ar://_kDPZpfse1WjDJHjjMyFs_Ran5weTf3h8Q3jpNLpTk0")
