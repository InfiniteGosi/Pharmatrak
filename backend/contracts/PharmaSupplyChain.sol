// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PharmaSupplyChain {
    
    // Struct lưu thông tin lô thuốc
    struct Batch {
        string batchId;
        address manufacturer;
        address currentOwner;   // Thêm: ai đang giữ lô thuốc hiện tại
        string mfgDate;
        string expDate;
        Status status;
        uint256 createdAt;
        bool exists;
    }
    
    // Struct lưu lịch sử chuyển giao
    struct TransferRecord {
        string action;
        address from;
        address to;
        string location;
        uint256 timestamp;
    }
    
    // Enum trạng thái
    enum Status { Created, InTransit, Delivered }
    
    // Danh sách lô thuốc
    mapping(string => Batch) public batches;

    // Lịch sử chuyển giao
    mapping(string => TransferRecord[]) public batchHistory;
    
    // Danh sách tất cả batch IDs
    string[] public batchIds;
    
    // Events
    event BatchRegistered(
        string batchId,
        address indexed manufacturer,
        string mfgDate,
        string expDate,
        uint256 timestamp
    );
    
    event BatchTransferred(
        string batchId,
        address indexed from,
        address indexed to,
        string location,
        uint256 timestamp
    );
    
    event BatchDelivered(
        string batchId,
        address indexed to,
        string location,
        uint256 timestamp
    );
    
    // Modifier kiểm tra lô thuốc tồn tại
    modifier batchExists(string memory _batchId) {
        require(batches[_batchId].exists, "Lo thuoc khong ton tai");
        _;
    }

    // Modifier kiểm tra lô thuốc chưa tồn tại
    modifier batchNotExists(string memory _batchId) {
        require(!batches[_batchId].exists, "Lo thuoc da ton tai");
        _;
    }
    
    // -------------------------
    //  REGISTER BATCH
    // -------------------------
    function registerBatch(
        string memory _batchId,
        string memory _mfgDate,
        string memory _expDate
    ) public batchNotExists(_batchId) {

        require(bytes(_batchId).length > 0, "Ma lo thuoc khong duoc de trong");
        require(bytes(_mfgDate).length > 0, "Ngay san xuat khong duoc de trong");
        require(bytes(_expDate).length > 0, "Han su dung khong duoc de trong");

        batches[_batchId] = Batch({
            batchId: _batchId,
            manufacturer: msg.sender,
            currentOwner: msg.sender, // manufacturer là chủ đầu tiên
            mfgDate: _mfgDate,
            expDate: _expDate,
            status: Status.Created,
            createdAt: block.timestamp,
            exists: true
        });

        batchIds.push(_batchId);

        batchHistory[_batchId].push(TransferRecord({
            action: "Registered",
            from: msg.sender,
            to: address(0),
            location: "Manufacturing Facility",
            timestamp: block.timestamp
        }));
        
        emit BatchRegistered(_batchId, msg.sender, _mfgDate, _expDate, block.timestamp);
    }
    
    // -------------------------
    //  TRANSFER BATCH
    // -------------------------
    function transferBatch(
        string memory _batchId,
        address _to,
        string memory _location
    ) public batchExists(_batchId) {

        Batch storage b = batches[_batchId];

        require(_to != address(0), "Nguoi nhan khong hop le");
        require(bytes(_location).length > 0, "Dia diem khong duoc de trong");
        require(b.status != Status.Delivered, "Lo thuoc da giao, khong the chuyen tiep");
        require(msg.sender == b.currentOwner, "Chi chu so huu hien tai moi duoc chuyen lo thuoc");

        address previousOwner = b.currentOwner;

        b.currentOwner = _to;
        b.status = Status.InTransit;

        batchHistory[_batchId].push(TransferRecord({
            action: "Transferred",
            from: previousOwner,
            to: _to,
            location: _location,
            timestamp: block.timestamp
        }));

        emit BatchTransferred(_batchId, previousOwner, _to, _location, block.timestamp);
    }

    // -------------------------
    //  CONFIRM DELIVERY
    // -------------------------
    function confirmDelivery(string memory _batchId)
        public
        batchExists(_batchId)
    {
        Batch storage b = batches[_batchId];

        require(b.status != Status.Delivered, "Lo thuoc da giao");
        require(msg.sender == b.currentOwner, "Chi nguoi nhan moi duoc xac nhan giao hang");

        // Cập nhật
        b.status = Status.Delivered;

        batchHistory[_batchId].push(TransferRecord({
            action: "Delivered",
            from: msg.sender,
            to: msg.sender,
            location: "Final Destination",
            timestamp: block.timestamp
        }));

        emit BatchDelivered(_batchId, msg.sender, "Final Destination", block.timestamp);
    }
    
    // -------------------------
    //  GETTERS
    // -------------------------
    function getBatch(string memory _batchId)
        public
        view
        batchExists(_batchId)
        returns (
            string memory batchId,
            address manufacturer,
            address currentOwner,
            string memory mfgDate,
            string memory expDate,
            Status status,
            uint256 createdAt
        )
    {
        Batch memory batch = batches[_batchId];
        return (
            batch.batchId,
            batch.manufacturer,
            batch.currentOwner,
            batch.mfgDate,
            batch.expDate,
            batch.status,
            batch.createdAt
        );
    }
    
    function getBatchHistory(string memory _batchId)
        public
        view
        batchExists(_batchId)
        returns (TransferRecord[] memory)
    {
        return batchHistory[_batchId];
    }
    
    function getTotalBatches() public view returns (uint256) {
        return batchIds.length;
    }
    
    function getBatchIdByIndex(uint256 _index) public view returns (string memory) {
        require(_index < batchIds.length, "Index vuot gioi han");
        return batchIds[_index];
    }
    
    function batchExistsCheck(string memory _batchId) public view returns (bool) {
        return batches[_batchId].exists;
    }
}
