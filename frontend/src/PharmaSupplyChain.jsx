import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  Package,
  Truck,
  CheckCircle,
  Plus,
  Search,
} from "lucide-react";
import { ethers } from "ethers";

// ⚠️ ABI ĐÃ FIX - Có currentOwner (7 return values)
const CONTRACT_ABI = [
  "function registerBatch(string memory _batchId, string memory _mfgDate, string memory _expDate) public",
  "function transferBatch(string memory _batchId, address _to, string memory _location) public",
  "function confirmDelivery(string memory _batchId) public",
  "function getBatch(string memory _batchId) public view returns (string memory batchId, address manufacturer, address currentOwner, string memory mfgDate, string memory expDate, uint8 status, uint256 createdAt)",
  "function getBatchHistory(string memory _batchId) public view returns (tuple(string action, address from, address to, string location, uint256 timestamp)[] memory)",
  "function getTotalBatches() public view returns (uint256)",
  "function getBatchIdByIndex(uint256 _index) public view returns (string memory)",
  "function batchExistsCheck(string memory _batchId) public view returns (bool)",
  "event BatchRegistered(string batchId, address indexed manufacturer, string mfgDate, string expDate, uint256 timestamp)",
  "event BatchTransferred(string batchId, address indexed from, address indexed to, string location, uint256 timestamp)",
  "event BatchDelivered(string batchId, address indexed to, string location, uint256 timestamp)",
];

// UPDATE địa chỉ này sau khi deploy
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const PharmaSupplyChain = () => {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState("");
  const [mfgDate, setMfgDate] = useState("");
  const [expDate, setExpDate] = useState("");
  const [searchId, setSearchId] = useState("");
  const [searchBatch, setSearchBatch] = useState(null);
  const [transferTo, setTransferTo] = useState("");
  const [transferLocation, setTransferLocation] = useState("");
  const [activeTab, setActiveTab] = useState("register");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBlockchainData();
  }, []);

  const loadBlockchainData = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await web3Provider.send("eth_requestAccounts", []);
        const web3Signer = await web3Provider.getSigner();

        setProvider(web3Provider);
        setSigner(web3Signer);
        setAccount(accounts[0]);

        const pharmaContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          web3Signer
        );
        setContract(pharmaContract);

        // Load tất cả batches
        await loadAllBatches(pharmaContract);

        // Listen to events
        pharmaContract.on("BatchRegistered", () => {
          loadAllBatches(pharmaContract);
        });

        pharmaContract.on("BatchTransferred", () => {
          if (searchId) loadBatchDetails(searchId, pharmaContract);
        });

        pharmaContract.on("BatchDelivered", () => {
          if (searchId) loadBatchDetails(searchId, pharmaContract);
        });
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await web3Provider.send("eth_requestAccounts", []);
        const web3Signer = await web3Provider.getSigner();

        setProvider(web3Provider);
        setSigner(web3Signer);
        setAccount(accounts[0]);

        const pharmaContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          web3Signer
        );
        setContract(pharmaContract);

        await loadAllBatches(pharmaContract);
      } catch (error) {
        alert("Vui lòng cài đặt MetaMask để sử dụng ứng dụng này");
      }
    } else {
      alert("Vui lòng cài đặt MetaMask để sử dụng ứng dụng này");
    }
  };

  const loadAllBatches = async (contractInstance) => {
    try {
      const total = await contractInstance.getTotalBatches();
      const batchesData = [];

      for (let i = 0; i < Number(total); i++) {
        const id = await contractInstance.getBatchIdByIndex(i);
        const batchData = await contractInstance.getBatch(id);
        const history = await contractInstance.getBatchHistory(id);

        batchesData.push({
          id: batchData[0],
          manufacturer: batchData[1],
          currentOwner: batchData[2], // Index 2
          mfgDate: batchData[3], // Index 3
          expDate: batchData[4], // Index 4
          status: ["Created", "In Transit", "Delivered"][Number(batchData[5])], // Index 5
          createdAt: new Date(Number(batchData[6]) * 1000).toISOString(), // Index 6
          history: history.map((h) => ({
            action: h.action,
            from: h.from,
            to: h.to,
            location: h.location,
            timestamp: new Date(Number(h.timestamp) * 1000).toISOString(),
          })),
        });
      }

      setBatches(batchesData);
      console.log("Loaded batches:", batchesData);
    } catch (error) {
      console.error("Error loading batches:", error);
    }
  };

  const loadBatchDetails = async (id, contractInstance = contract) => {
    try {
      const exists = await contractInstance.batchExistsCheck(id);
      if (!exists) {
        setSearchBatch(null);
        return;
      }

      const batchData = await contractInstance.getBatch(id);
      const history = await contractInstance.getBatchHistory(id);

      setSearchBatch({
        id: batchData[0],
        manufacturer: batchData[1],
        currentOwner: batchData[2],
        mfgDate: batchData[3],
        expDate: batchData[4],
        status: ["Created", "In Transit", "Delivered"][Number(batchData[5])],
        createdAt: new Date(Number(batchData[6]) * 1000).toISOString(),
        history: history.map((h) => ({
          action: h.action,
          from: h.from,
          to: h.to,
          location: h.location,
          timestamp: new Date(Number(h.timestamp) * 1000).toISOString(),
        })),
      });
    } catch (error) {
      console.error("Error loading batch details:", error);
      setSearchBatch(null);
    }
  };

  useEffect(() => {
    if (searchId && contract) {
      loadBatchDetails(searchId);
    } else {
      setSearchBatch(null);
    }
  }, [searchId, contract]);

  const registerBatch = async () => {
    if (!batchId || !mfgDate || !expDate) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (!contract) {
      alert("Vui lòng kết nối ví MetaMask");
      return;
    }

    try {
      setLoading(true);
      const tx = await contract.registerBatch(batchId, mfgDate, expDate);
      await tx.wait();

      alert(`Lô thuốc ${batchId} đã được đăng ký thành công!`);
      setBatchId("");
      setMfgDate("");
      setExpDate("");

      await loadAllBatches(contract);
    } catch (error) {
      console.error("Error registering batch:", error);
      if (error.reason) {
        alert(`Lỗi: ${error.reason}`);
      } else {
        alert("Có lỗi xảy ra khi đăng ký lô thuốc");
      }
    } finally {
      setLoading(false);
    }
  };

  const transferBatch = async () => {
    if (!searchId || !transferTo || !transferLocation) {
      alert("Vui lòng nhập đầy đủ thông tin chuyển giao");
      return;
    }

    if (!contract) {
      alert("Vui lòng kết nối ví MetaMask");
      return;
    }

    try {
      setLoading(true);
      const tx = await contract.transferBatch(
        searchId,
        transferTo,
        transferLocation
      );
      await tx.wait();

      alert("Chuyển giao thành công!");
      setTransferTo("");
      setTransferLocation("");

      await loadBatchDetails(searchId);
      await loadAllBatches(contract);
    } catch (error) {
      console.error("Error transferring batch:", error);
      if (error.reason) {
        alert(`Lỗi: ${error.reason}`);
      } else {
        alert("Có lỗi xảy ra khi chuyển giao");
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmDelivery = async () => {
    if (!searchId) {
      alert("Vui lòng nhập mã lô thuốc");
      return;
    }

    if (!contract) {
      alert("Vui lòng kết nối ví MetaMask");
      return;
    }

    try {
      setLoading(true);
      const tx = await contract.confirmDelivery(searchId);
      await tx.wait();

      alert("Xác nhận giao hàng thành công!");

      await loadBatchDetails(searchId);
      await loadAllBatches(contract);
    } catch (error) {
      console.error("Error confirming delivery:", error);
      if (error.reason) {
        alert(`Lỗi: ${error.reason}`);
      } else {
        alert("Có lỗi xảy ra khi xác nhận giao hàng");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Created":
        return "bg-blue-100 text-blue-800";
      case "In Transit":
        return "bg-yellow-100 text-yellow-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-indigo-900 mb-2">
                Hệ thống Truy Xuất Nguồn Gốc Dược Phẩm
              </h1>
              <p className="text-gray-600">
                Blockchain-based Supply Chain Tracking
              </p>
            </div>
            {account ? (
              <div className="text-right">
                <p className="text-sm text-gray-500">Địa chỉ ví</p>
                <p className="text-xs font-mono bg-indigo-50 px-3 py-2 rounded">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </p>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
              >
                Kết nối MetaMask
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 py-4 px-6 font-semibold ${
                activeTab === "register"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Plus className="inline mr-2" size={20} />
              Đăng ký lô thuốc
            </button>
            <button
              onClick={() => setActiveTab("transfer")}
              className={`flex-1 py-4 px-6 font-semibold ${
                activeTab === "transfer"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Truck className="inline mr-2" size={20} />
              Chuyển giao
            </button>
            <button
              onClick={() => setActiveTab("confirm")}
              className={`flex-1 py-4 px-6 font-semibold ${
                activeTab === "confirm"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <CheckCircle className="inline mr-2" size={20} />
              Xác nhận nhận hàng
            </button>
          </div>

          <div className="p-6">
            {/* Register Tab */}
            {activeTab === "register" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã lô thuốc
                  </label>
                  <input
                    type="text"
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Ví dụ: BATCH001"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày sản xuất
                    </label>
                    <input
                      type="date"
                      value={mfgDate}
                      onChange={(e) => setMfgDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hạn sử dụng
                    </label>
                    <input
                      type="date"
                      value={expDate}
                      onChange={(e) => setExpDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <button
                  onClick={registerBatch}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold disabled:bg-gray-400"
                >
                  {loading ? "Đang xử lý..." : "Đăng ký lô thuốc"}
                </button>
              </div>
            )}

            {/* Transfer Tab */}
            {activeTab === "transfer" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã lô thuốc
                  </label>
                  <input
                    type="text"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Nhập mã lô thuốc"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đến (địa chỉ ví người nhận)
                  </label>
                  <input
                    type="text"
                    value={transferTo}
                    onChange={(e) => setTransferTo(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Địa chỉ ví bên nhận"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa điểm
                  </label>
                  <input
                    type="text"
                    value={transferLocation}
                    onChange={(e) => setTransferLocation(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Địa điểm giao hàng"
                  />
                </div>
                {searchBatch && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Chủ sở hữu hiện tại:</strong>{" "}
                      {searchBatch.currentOwner.slice(0, 10)}...
                      {searchBatch.currentOwner.slice(-8)}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Chỉ chủ sở hữu hiện tại mới có thể chuyển giao lô thuốc
                      này
                    </p>
                  </div>
                )}
                <button
                  onClick={transferBatch}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold disabled:bg-gray-400"
                >
                  {loading ? "Đang xử lý..." : "Chuyển giao"}
                </button>
              </div>
            )}

            {/* Confirm Tab */}
            {activeTab === "confirm" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã lô thuốc
                  </label>
                  <input
                    type="text"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Nhập mã lô thuốc"
                  />
                </div>
                <button
                  onClick={confirmDelivery}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold disabled:bg-gray-400"
                >
                  {loading ? "Đang xử lý..." : "Xác nhận nhận hàng"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search and Display */}
        {searchBatch && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Thông tin lô thuốc: {searchBatch.id}
              </h2>
              <span
                className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(
                  searchBatch.status
                )}`}
              >
                {searchBatch.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Nhà sản xuất</p>
                <p className="font-mono text-sm">
                  {searchBatch.manufacturer.slice(0, 10)}...
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Chủ sở hữu hiện tại</p>
                <p className="font-mono text-sm">
                  {searchBatch.currentOwner.slice(0, 10)}...
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ngày sản xuất</p>
                <p className="font-semibold">{searchBatch.mfgDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Hạn sử dụng</p>
                <p className="font-semibold">{searchBatch.expDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ngày đăng ký</p>
                <p className="font-semibold">
                  {new Date(searchBatch.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">
                Lịch sử chuyển giao
              </h3>
              <div className="space-y-4">
                {searchBatch.history.map((record, idx) => (
                  <div
                    key={idx}
                    className="flex items-start p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-shrink-0 mr-4">
                      {record.action === "Registered" && (
                        <Package className="text-blue-600" size={24} />
                      )}
                      {record.action === "Transferred" && (
                        <Truck className="text-yellow-600" size={24} />
                      )}
                      {record.action === "Delivered" && (
                        <CheckCircle className="text-green-600" size={24} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {record.action}
                      </p>
                      {record.from !==
                        "0x0000000000000000000000000000000000000000" && (
                        <p className="text-sm text-gray-600">
                          Từ: {record.from.slice(0, 10)}...
                        </p>
                      )}
                      {record.to !==
                        "0x0000000000000000000000000000000000000000" && (
                        <p className="text-sm text-gray-600">
                          Đến: {record.to.slice(0, 10)}...
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        Địa điểm: {record.location}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(record.timestamp).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* All Batches */}
        {batches.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Tất cả lô thuốc
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {batches.map((batch) => (
                <div
                  key={batch.id}
                  onClick={() => setSearchId(batch.id)}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 cursor-pointer transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-800">{batch.id}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                        batch.status
                      )}`}
                    >
                      {batch.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">NSX: {batch.mfgDate}</p>
                  <p className="text-sm text-gray-600">HSD: {batch.expDate}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {batch.history.length} lần chuyển giao
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PharmaSupplyChain;
