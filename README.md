# PharmaTrak - Pharmaceutical Supply Chain Tracking System

A blockchain-based pharmaceutical supply chain tracking system built with Ethereum smart contracts and React. This decentralized application (DApp) enables transparent and immutable tracking of pharmaceutical products from manufacturer to end recipient.

## Features

- **Batch Registration**: Manufacturers can register new pharmaceutical batches with manufacturing and expiration dates
- **Transfer Tracking**: Track the movement of pharmaceutical products through the supply chain
- **Delivery Confirmation**: Recipients can confirm delivery of pharmaceutical products
- **Complete History**: View the complete transfer history of any batch
- **Real-time Updates**: Automatic updates when blockchain events occur
- **Transparent & Immutable**: All records are stored on the Ethereum blockchain

## Tech Stack

### Backend (Blockchain)
- **Solidity** - Smart contract development
- **Hardhat** - Ethereum development environment
- **Ethers.js** - Ethereum library for interacting with smart contracts

### Frontend
- **React** - UI framework
- **Ethers.js v6** - Web3 integration
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **MetaMask** - Wallet integration

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MetaMask](https://metamask.io/) browser extension
- [Git](https://git-scm.com/)

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/InfiniteGosi/Pharmatrak.git
cd Pharmatrak
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

## Usage

### 1. Start Hardhat Local Blockchain

Open a terminal and run:
```bash
cd backend
npx hardhat node
```

Keep this terminal running. You should see output showing test accounts with their addresses and private keys.

### 2. Deploy Smart Contract

Open a new terminal and deploy the contract:
```bash
cd backend
npx hardhat run scripts/deploy.js --network localhost
```

Copy the deployed contract address from the output:
```
PharmaSupplyChain deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### 3. Update Contract Address in Frontend

Open `frontend/src/PharmaSupplyChain.jsx` and update the contract address:
```javascript
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Your deployed address
```

### 4. Configure MetaMask

1. Open MetaMask browser extension
2. Click network dropdown → **Add network** → **Add a network manually**
3. Enter these details:
   - **Network Name**: Hardhat Local
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `1337`
   - **Currency Symbol**: ETH
4. Save and switch to this network

### 5. Import Test Account to MetaMask

1. Copy a private key from the Hardhat node terminal output
2. In MetaMask: Click account icon → **Import Account**
3. Paste the private key and import
4. You should see ~10000 ETH balance

### 6. Start Frontend Application
```bash
cd frontend
npm start
```

The application will open at `http://localhost:3000`

### 7. Connect MetaMask

1. Click "Kết nối MetaMask" button in the application
2. Approve the connection in MetaMask
3. You're ready to use the application!

## Smart Contract

### Main Functions

**Register Batch**
```solidity
function registerBatch(
    string memory _batchId,
    string memory _mfgDate,
    string memory _expDate
) public
```

**Transfer Batch**
```solidity
function transferBatch(
    string memory _batchId,
    address _to,
    string memory _location
) public
```

**Confirm Delivery**
```solidity
function confirmDelivery(string memory _batchId) public
```

**Get Batch Information**
```solidity
function getBatch(string memory _batchId) public view returns (...)
```

**Get Batch History**
```solidity
function getBatchHistory(string memory _batchId) public view returns (TransferRecord[] memory)
```

### Contract Features

- **Ownership Control**: Only the current owner can transfer a batch
- **Status Management**: Tracks batch status (Created, InTransit, Delivered)
- **Event Logging**: Emits events for all major actions
- **History Tracking**: Maintains complete transfer history
- **Validation**: Input validation and error handling

## Project Structure
```
Pharmatrak/
├── backend/
│   ├── contracts/
│   │   └── PharmaSupplyChain.sol    # Smart contract
│   ├── scripts/
│   │   └── deploy.js                 # Deployment script
│   ├── test/                         # Contract tests
│   ├── hardhat.config.js            # Hardhat configuration
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── PharmaSupplyChain.jsx    # Main React component
    │   └── App.js
    ├── public/
    ├── package.json
    └── tailwind.config.js
```

## Application Features

### 1. Register Batch Tab
- Register new pharmaceutical batches
- Input batch ID, manufacturing date, and expiration date
- Automatically assigns manufacturer address

### 2. Transfer Tab
- Transfer ownership of pharmaceutical batches
- Specify recipient address and location
- Only current owner can initiate transfer

### 3. Confirm Delivery Tab
- Confirm receipt of pharmaceutical products
- Updates batch status to "Delivered"
- Only current owner can confirm delivery

### 4. Batch Information Display
- View complete batch details
- See current status (Created, In Transit, Delivered)
- View complete transfer history with timestamps
- Color-coded status badges

### 5. All Batches Overview
- Grid view of all registered batches
- Quick status overview
- Click to view detailed information
