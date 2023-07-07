import json
from collections import defaultdict
from pathlib import Path

from brownie import network, Contract


def update_address(contract_name, contract):
    filepath = f"./metadata/network_to_cid.json"
    data = None
    with open(filepath, "rb") as file:
        data = json.load(file)
    with open(filepath, "w") as file:
        if data.get(network.show_active()) is None:
            data[network.show_active()] = defaultdict(dict)
        data[network.show_active()][contract_name] = contract.address
        json.dump(data, file, sort_keys=True, indent=4)


def read_address(contract_name, contract_type):
    filepath = f"./metadata/network_to_cid.json"
    with Path(filepath).open("rb") as fp:
        address = json.load(fp)[network.show_active()][contract_name]
        return Contract.from_abi(
            contract_name,
            address,
            contract_type.abi,
        )
