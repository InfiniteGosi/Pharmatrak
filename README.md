# BÁO CÁO ĐỒ ÁN CUỐI KỲ

## HỆ THỐNG TRUY XUẤT NGUỒN GỐC DƯỢC PHẨM TRÊN BLOCKCHAIN

---

## 1. GIỚI THIỆU

### 1.1. Tổng quan dự án

- **Tên dự án:** PharmaTrak - Pharmaceutical Supply Chain Tracking System
- **Mục đích:** Xây dựng hệ thống truy xuất nguồn gốc dược phẩm minh bạch, bảo mật và không thể thay đổi dựa trên công nghệ Blockchain
- **Công nghệ:** Ethereum Smart Contract, React, Web3

### 1.2. Vấn đề cần giải quyết

- Thuốc giả, thuốc kém chất lượng tràn lan trên thị trường
- Khó kiểm soát nguồn gốc và quá trình vận chuyển dược phẩm
- Thiếu tính minh bạch trong chuỗi cung ứng
- Không có hệ thống lưu trữ lịch sử chuyển giao đáng tin cậy

### 1.3. Giải pháp đề xuất

Sử dụng Blockchain để:

- Lưu trữ thông tin lô thuốc bất biến
- Theo dõi toàn bộ hành trình chuyển giao
- Xác thực nguồn gốc và quyền sở hữu
- Đảm bảo tính minh bạch cho tất cả các bên liên quan

---

## 2. KIẾN TRÚC HỆ THỐNG

### 2.1. Tổng quan kiến trúc

```
┌─────────────────┐
│   Frontend      │ ← React + Web3
│   (React App)   │
└────────┬────────┘
         │
         ↓ Ethers.js
┌─────────────────┐
│   MetaMask      │ ← Wallet
└────────┬────────┘
         │
         ↓ JSON-RPC
┌─────────────────┐
│   Blockchain    │ ← Ethereum
│ (Smart Contract)│
└─────────────────┘
```

### 2.2. Các thành phần chính

#### Backend (Blockchain)

- **Smart Contract (Solidity):** Logic nghiệp vụ và lưu trữ dữ liệu
- **Hardhat:** Framework phát triển và testing
- **Ethers.js:** Thư viện tương tác với blockchain

#### Frontend (Web Application)

- **React:** Framework xây dựng giao diện
- **Ethers.js v6:** Kết nối với blockchain
- **Tailwind CSS:** Styling
- **MetaMask:** Ví điện tử và xác thực

---

## 3. SMART CONTRACT

### 3.1. Cấu trúc dữ liệu

#### Struct Batch

```solidity
struct Batch {
    string batchId;           // Mã lô thuốc
    address manufacturer;     // Địa chỉ nhà sản xuất
    address currentOwner;     // Chủ sở hữu hiện tại
    string mfgDate;          // Ngày sản xuất
    string expDate;          // Hạn sử dụng
    Status status;           // Trạng thái
    uint256 createdAt;       // Thời gian tạo
    bool exists;             // Kiểm tra tồn tại
}
```

#### Struct TransferRecord

```solidity
struct TransferRecord {
    string action;           // Hành động (Registered/Transferred/Delivered)
    address from;            // Người gửi
    address to;              // Người nhận
    string location;         // Địa điểm
    uint256 timestamp;       // Thời gian
}
```

#### Enum Status

```solidity
enum Status {
    Created,      // Đã tạo
    InTransit,    // Đang vận chuyển
    Delivered     // Đã giao
}
```

### 3.2. Các chức năng chính

#### 3.2.1. Đăng ký lô thuốc

```solidity
function registerBatch(
    string memory _batchId,
    string memory _mfgDate,
    string memory _expDate
) public
```

- Cho phép nhà sản xuất đăng ký lô thuốc mới
- Lưu thông tin và gán quyền sở hữu ban đầu
- Tạo bản ghi lịch sử đầu tiên

#### 3.2.2. Chuyển giao lô thuốc

```solidity
function transferBatch(
    string memory _batchId,
    address _to,
    string memory _location
) public
```

- Chuyển quyền sở hữu từ người này sang người khác
- Chỉ chủ sở hữu hiện tại mới được phép chuyển
- Cập nhật trạng thái và lưu lịch sử

#### 3.2.3. Xác nhận giao hàng

```solidity
function confirmDelivery(string memory _batchId) public
```

- Người nhận xác nhận đã nhận hàng
- Cập nhật trạng thái thành "Delivered"
- Kết thúc quá trình vận chuyển

#### 3.2.4. Truy vấn thông tin

```solidity
function getBatch(string memory _batchId) public view returns (...)
function getBatchHistory(string memory _batchId) public view returns (...)
function getTotalBatches() public view returns (uint256)
```

### 3.3. Cơ chế bảo mật

- **Access Control:** Chỉ chủ sở hữu mới được chuyển giao
- **Validation:** Kiểm tra đầu vào và trạng thái
- **Immutability:** Dữ liệu không thể chỉnh sửa sau khi lưu
- **Events:** Ghi log mọi hành động quan trọng

---

## 4. GIAO DIỆN NGƯỜI DÙNG

### 4.1. Trang chủ

- Hiển thị thông tin kết nối ví
- Địa chỉ ví người dùng
- Nút kết nối MetaMask

### 4.2. Tab Đăng ký lô thuốc

**Chức năng:**

- Nhập mã lô thuốc
- Nhập ngày sản xuất
- Nhập hạn sử dụng
- Nút đăng ký

**Quy trình:**

1. Nhà sản xuất nhập thông tin
2. Nhấn "Đăng ký lô thuốc"
3. MetaMask hiện popup xác nhận
4. Transaction được gửi lên blockchain
5. Hiển thị thông báo thành công

### 4.3. Tab Chuyển giao

**Chức năng:**

- Tìm kiếm lô thuốc theo mã
- Nhập địa chỉ người nhận
- Nhập địa điểm chuyển giao
- Nút chuyển giao

**Quy trình:**

1. Nhập mã lô thuốc
2. Hệ thống hiển thị thông tin lô thuốc
3. Nhập địa chỉ người nhận và địa điểm
4. Xác nhận chuyển giao qua MetaMask
5. Cập nhật trạng thái và lịch sử

### 4.4. Tab Xác nhận nhận hàng

**Chức năng:**

- Nhập mã lô thuốc
- Xem thông tin chi tiết
- Nút xác nhận nhận hàng

**Quy trình:**

1. Người nhận nhập mã lô thuốc
2. Kiểm tra thông tin
3. Xác nhận đã nhận hàng
4. Trạng thái chuyển thành "Delivered"

### 4.5. Hiển thị thông tin lô thuốc

**Thông tin cơ bản:**

- Mã lô thuốc
- Nhà sản xuất
- Chủ sở hữu hiện tại
- Ngày sản xuất
- Hạn sử dụng
- Trạng thái (với màu sắc phân biệt)

**Lịch sử chuyển giao:**

- Danh sách các bước chuyển giao
- Icon phân biệt (Registered/Transferred/Delivered)
- Thông tin từ - đến
- Địa điểm
- Thời gian cụ thể

### 4.6. Danh sách tất cả lô thuốc

- Hiển thị dạng grid
- Thông tin tóm tắt từng lô
- Click để xem chi tiết
- Số lần chuyển giao

---

## 5. LUỒNG HOẠT ĐỘNG

### 5.1. Luồng đăng ký lô thuốc mới

```
Nhà sản xuất → Nhập thông tin → Gửi transaction
    ↓
Smart Contract → Validate → Lưu thông tin
    ↓
Emit Event → Frontend cập nhật → Hiển thị thông báo
```

### 5.2. Luồng chuyển giao

```
Chủ hiện tại → Nhập người nhận → Xác nhận
    ↓
Smart Contract → Kiểm tra quyền → Chuyển ownership
    ↓
Cập nhật status → Lưu history → Emit Event
    ↓
Frontend → Load lại dữ liệu → Hiển thị
```

### 5.3. Luồng xác nhận giao hàng

```
Người nhận → Click xác nhận → Gửi transaction
    ↓
Smart Contract → Kiểm tra quyền → Cập nhật status
    ↓
Status = Delivered → Lưu record cuối → Emit Event
    ↓
Frontend → Cập nhật UI → Hoàn tất
```

---

## 6. CÔNG NGHỆ SỬ DỤNG

### 6.1. Backend/Blockchain

| Công nghệ | Phiên bản | Mục đích                          |
| --------- | --------- | --------------------------------- |
| Solidity  | ^0.8.0    | Ngôn ngữ lập trình Smart Contract |
| Hardhat   | Latest    | Framework phát triển Ethereum     |
| Ethers.js | v6        | Thư viện tương tác blockchain     |

### 6.2. Frontend

| Công nghệ    | Phiên bản | Mục đích         |
| ------------ | --------- | ---------------- |
| React        | 18.x      | Framework UI     |
| Ethers.js    | 6.15.0    | Web3 integration |
| Tailwind CSS | 3.x       | Styling          |
| Lucide React | Latest    | Icons            |

### 6.3. Tools & Environment

- **Node.js:** v16+
- **MetaMask:** Browser wallet
- **Hardhat Network:** Local blockchain
- **Git/GitHub:** Version control

## 7. DEMO VÀ KẾT QUẢ

### 7.1. Kịch bản demo

#### Scenario 1: Nhà sản xuất đăng ký lô thuốc

1. Login với account nhà sản xuất
2. Nhập thông tin: BATCH001, ngày SX, HSD
3. Đăng ký thành công
4. Kiểm tra trạng thái: "Created"

#### Scenario 2: Chuyển đến nhà phân phối

1. Nhà sản xuất chuyển đến distributor
2. Nhập địa chỉ và địa điểm
3. Xác nhận transaction
4. Trạng thái: "In Transit"
5. Lịch sử ghi nhận chuyển giao

#### Scenario 3: Chuyển đến nhà thuốc

1. Nhà phân phối chuyển đến pharmacy
2. Cập nhật ownership
3. Lịch sử thêm bản ghi mới

#### Scenario 4: Xác nhận giao hàng cuối

1. Nhà thuốc xác nhận nhận hàng
2. Trạng thái: "Delivered"
3. Hoàn tất chuỗi cung ứng

### 7.2. Kết quả đạt được

- ✅ Đăng ký lô thuốc thành công
- ✅ Chuyển giao quyền sở hữu chính xác
- ✅ Lưu lịch sử đầy đủ, không thể sửa đổi
- ✅ Giao diện thân thiện, dễ sử dụng
- ✅ Bảo mật với MetaMask
- ✅ Real-time updates qua events

### 7.3. Screenshots

(Đính kèm ảnh chụp màn hình các chức năng)

---

## 8. ƯU ĐIỂM VÀ HẠN CHẾ

### 8.1. Ưu điểm

✅ **Minh bạch:** Mọi giao dịch được ghi nhận công khai
✅ **Bất biến:** Dữ liệu không thể chỉnh sửa hay xóa
✅ **Bảo mật:** Sử dụng cryptography và smart contract
✅ **Truy xuất nguồn gốc:** Theo dõi toàn bộ hành trình
✅ **Phi tập trung:** Không phụ thuộc vào bên thứ ba
✅ **Tự động hóa:** Logic được thực thi tự động

### 8.2. Hạn chế

⚠️ **Chi phí gas:** Mỗi transaction tốn phí
⚠️ **Tốc độ:** Phụ thuộc vào blockchain network
⚠️ **Khả năng mở rộng:** Cần tối ưu cho số lượng lớn
⚠️ **Yêu cầu kỹ thuật:** Người dùng cần hiểu về wallet
⚠️ **Dữ liệu on-chain:** Giới hạn về dung lượng lưu trữ

## 9. KẾT LUẬN

### 9.1. Tổng kết

Dự án PharmaTrak đã xây dựng thành công một hệ thống truy xuất nguồn gốc dược phẩm dựa trên Blockchain với các tính năng:

- Đăng ký và quản lý lô thuốc
- Chuyển giao quyền sở hữu an toàn
- Lưu lịch sử minh bạch và bất biến
- Giao diện người dùng thân thiện

### 9.2. Ý nghĩa thực tiễn

- Giảm thuốc giả trên thị trường
- Tăng độ tin cậy cho người tiêu dùng
- Minh bạch hóa chuỗi cung ứng
- Dễ dàng truy xuất nguồn gốc
- Tạo nền tảng cho các ứng dụng tương tự

### 9.3. Bài học kinh nghiệm

- Hiểu rõ về Blockchain và Smart Contract
- Kỹ năng phát triển DApp với Web3
- Tích hợp Frontend với Blockchain
- Xử lý transactions và events
- Testing và debugging Smart Contract

---

## 10. TÀI LIỆU THAM KHẢO

1. **Solidity Documentation**

   - https://docs.soliditylang.org/

2. **Hardhat Documentation**

   - https://hardhat.org/docs

3. **Ethers.js Documentation**

   - https://docs.ethers.org/v6/

4. **React Documentation**

   - https://react.dev/

5. **MetaMask Documentation**

   - https://docs.metamask.io/

6. **Ethereum Whitepaper**
   - https://ethereum.org/en/whitepaper/

---

## PHỤ LỤC

### A. Source Code

- GitHub Repository: https://github.com/InfiniteGosi/Pharmatrak

### B. Video Demo

- Link: [Demo](https://youtu.be/_dwUFxWZah8)
