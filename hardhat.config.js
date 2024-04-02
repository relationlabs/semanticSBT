require('@nomicfoundation/hardhat-toolbox');
require('@nomiclabs/hardhat-ethers');
require('@openzeppelin/hardhat-upgrades');
require('hardhat-contract-sizer');
require('path');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.12',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,
        details: {
          yul: true,
        },
      },
      viaIR: true,
    },
  },
  mocha: {
    timeout: 100000000,
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
  networks: {
    ethereum: {
      url: `https://eth.llamarpc.com`,
      accounts: [process.env.ETH_PRIVATE_KEY],
    },
    polygon: {
      url: `https://polygon-rpc.com`,
      accounts: [process.env.POLYGON_PRIVATE_KEY],
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.WEB3_INFURA_PROJECT_ID}`,
      accounts: [process.env.GOERLI_PRIVATE_KEY],
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${process.env.WEB3_INFURA_PROJECT_ID}`,
      accounts: [process.env.MUMBAI_PRIVATE_KEY],
    },
    bsc_testnet: {
      url: `https://endpoints.omniatech.io/v1/bsc/testnet/public`,
      accounts: [process.env.BSC_TEST_PRIVATE_KEY],
    },
    base: {
      url: `https://base-mainnet.g.alchemy.com/v2/${process.env.WEB3_ALCHEMY_KEY}`,
      accounts: [process.env.BASE_PRIVATE_KEY],
    },
    optimistic: {
      url: `https://opt-mainnet.g.alchemy.com/v2/${process.env.WEB3_ALCHEMY_KEY}`,
      accounts: [process.env.OP_PRIVATE_KEY],
    },
    optimismSepolia: {
      chainId: 11155420,
      url: `https://opt-sepolia.g.alchemy.com/v2/${process.env.WEB3_ALCHEMY_KEY}`,
      accounts: [process.env.OP_SEPOLIA_PRIVATE_KEY],
    },
    arbitrum: {
      chainId: 42161,
      url: `https://arb-mainnet.g.alchemy.com/v2/${process.env.WEB3_ALCHEMY_KEY}`,
      accounts: [process.env.ARB_PRIVATE_KEY],
    }
  },
  etherscan: {
    apiKey: {
      polygon: process.env.POLYGONSCAN_TOKEN,
      mumbai: process.env.POLYGONSCAN_TOKEN,
      goerli: process.env.ETHERSCAN_TOKEN,
    },
    customChains: [
      {
        network: 'goerli',
        chainId: 5,
        urls: {
          apiURL: 'http://api-goerli.etherscan.io/api',
          browserURL: 'https://goerli.etherscan.io/',
        },
      },
      {
        network: 'etherum',
        chainId: 1,
        urls: {
          apiURL: 'https:/api.etherscan.io/api',
          browserURL: 'https://etherscan.io/',
        },
      },
      {
        network: 'polygon',
        chainId: 137,
        urls: {
          apiURL: 'https://api.polygonscan.com/api',
          browserURL: 'https://polygonscan.com/',
        },
      },
      {
        network: 'mumbai',
        chainId: 80001,
        urls: {
          apiURL: 'https://api-testnet.polygonscan.com/api',
          browserURL: 'https://mumbai.polygonscan.com/',
        },
      },
      {
        network: 'bsc_testnet',
        chainId: 97,
        urls: {
          apiURL: 'https:/api-testnet.bscscan.com/api',
          browserURL: 'https://bscscan.com/',
        },
      },
    ],
  },
};
