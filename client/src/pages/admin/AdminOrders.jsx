import React, {useEffect, useState} from "react";
import {Card, Table, Modal, Form, Input, Button, Tag, Select, Space, Popconfirm, message, Descriptions, Divider, Row, Col} from "antd";
import {ReloadOutlined, SearchOutlined, EyeOutlined, DeleteOutlined, EditOutlined} from "@ant-design/icons";
import {adminApi} from "../../utils/adminApi";

const formatVnd = (v) => new Intl.NumberFormat("vi-VN", {style: "currency", currency: "VND"}).format(v);

const statusTags = {
    pending: { color: "warning", text: "Chờ xử lý" },
    confirmed: { color: "success", text: "Đã thanh toán" },
    cancelled: { color: "error", text: "Đã hủy" },
};

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [orderDetails, setOrderDetails] = useState([]);
    const [updateStatus, setUpdateStatus] = useState("");
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [updating, setUpdating] = useState(false);

    // Fetch all bookings from server
    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = {};
            if (statusFilter !== "All") params.status = statusFilter;
            if (searchQuery.trim()) params.q = searchQuery.trim();

            const {data} = await adminApi.get("/bookings", {params});
            if (data.success) {
                setOrders(data.data || []);
            }
        } catch (error) {
            message.error(error.response?.data?.message || "Không thể tải danh sách đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const handleSearch = () => {
        fetchOrders();
    };

    // View detail modal
    const viewDetail = async (order) => {
        setDetailLoading(true);
        setSelectedOrder(order);
        setUpdateStatus(order.status);
        try {
            const {data} = await adminApi.get(`/bookings/${order.id}`);
            if (data.success) {
                setOrderDetails(data.data.details || []);
                setSelectedOrder(data.data.booking);
            }
        } catch (error) {
            message.error("Không thể tải chi tiết đơn hàng");
        } finally {
            setDetailLoading(false);
        }
    };

    // Update status
    const handleUpdateStatus = async () => {
        if (!selectedOrder) return;
        setUpdating(true);
        try {
            const {data} = await adminApi.put(`/bookings/${selectedOrder.id}/status`, {status: updateStatus});
            if (data.success) {
                message.success("Cập nhật trạng thái đơn hàng thành công");
                setIsStatusModalOpen(false);
                fetchOrders();
                const updatedBooking = {...selectedOrder, status: updateStatus};
                setSelectedOrder(updatedBooking);
            }
        } catch (error) {
            message.error(error.response?.data?.message || "Lỗi khi cập nhật đơn hàng");
        } finally {
            setUpdating(false);
        }
    };

    // Delete booking
    const handleDeleteOrder = async (id) => {
        try {
            const {data} = await adminApi.delete(`/bookings/${id}`);
            if (data.success) {
                message.success("Đã xóa đơn hàng thành công!");
                fetchOrders();
                if (selectedOrder && selectedOrder.id === id) {
                    setSelectedOrder(null);
                }
            }
        } catch (error) {
            message.error(error.response?.data?.message || "Xóa đơn hàng thất bại");
        }
    };

    // Ant Design Columns
    const columns = [
        {
            title: "Mã đơn",
            dataIndex: "id",
            key: "id",
            width: 90,
            align: "center",
            render: (id) => <span className="fw-medium">#ODR-{String(id).padStart(5, "0")}</span>,
        },
        {
            title: "Khách hàng",
            dataIndex: "full_name",
            key: "full_name",
            render: (name, record) => (
                <div>
                    <div className="fw-medium">{name}</div>
                    <div className="text-muted small">{record.phone_number}</div>
                </div>
            )
        },
        {
            title: "Tour du lịch",
            dataIndex: "tour_name",
            key: "tour_name",
            ellipsis: true,
        },
        {
            title: "Ngày đi",
            dataIndex: "departure_date",
            key: "departure_date",
            width: 120,
            align: "center",
            render: (date) => date ? new Date(date).toLocaleDateString("vi-VN") : "",
        },
        {
            title: "Tổng tiền",
            dataIndex: "total_price",
            key: "total_price",
            width: 140,
            align: "right",
            render: (price) => formatVnd(price),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 130,
            align: "center",
            render: (status) => {
                const tag = statusTags[status] || { color: "default", text: status };
                return <Tag color={tag.color}>{tag.text}</Tag>;
            }
        },
        {
            title: "Hành động",
            key: "actions",
            width: 260,
            align: "center",
            render: (_, record) => (
                <Space>
                    <Button size="small" icon={<EyeOutlined />} onClick={() => viewDetail(record)}>
                        Chi tiết
                    </Button>
                    <Button size="small" icon={<EditOutlined />} onClick={() => { setSelectedOrder(record); setUpdateStatus(record.status); setIsStatusModalOpen(true); }}>
                        Trạng thái
                    </Button>
                    <Popconfirm
                        title="Xóa đơn hàng"
                        description="Bạn chắc chắn muốn xóa đơn hàng này?"
                        okText="Xóa"
                        cancelText="Hủy"
                        onConfirm={() => handleDeleteOrder(record.id)}
                    >
                        <Button size="small" danger icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div className="admin-orders-page p-3">
            <Card className="shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                    <h5 className="fw-bold mb-0">Quản lý Đơn hàng (Bookings)</h5>
                    <Button icon={<ReloadOutlined />} onClick={fetchOrders} loading={loading}>
                        Tải lại
                    </Button>
                </div>

                <Row gutter={[16, 16]} className="mb-3">
                    <Col xs={24} md={12} lg={8}>
                        <Input.Search
                            allowClear
                            placeholder="Tìm mã đơn, tên, email, sđt, tên tour..."
                            enterButton={<SearchOutlined />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onSearch={handleSearch}
                        />
                    </Col>
                    <Col xs={24} md={12} lg={6}>
                        <Select
                            placeholder="Lọc trạng thái"
                            style={{width: "100%"}}
                            value={statusFilter}
                            onChange={setStatusFilter}
                        >
                            <Select.Option value="All">Tất cả trạng thái</Select.Option>
                            <Select.Option value="Pending">Chờ xử lý (Pending)</Select.Option>
                            <Select.Option value="Confirmed">Đã thanh toán (Confirmed)</Select.Option>
                            <Select.Option value="Cancelled">Đã hủy (Cancelled)</Select.Option>
                        </Select>
                    </Col>
                </Row>

                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={orders}
                    loading={loading}
                    scroll={{ x: "max-content" }}
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `Tổng số: ${total} đơn hàng`,
                    }}
                />
            </Card>

            {/* Detail View Modal */}
            <Modal
                title={`Chi tiết đơn hàng #ODR-${String(selectedOrder?.id || "").padStart(5, "0")}`}
                open={!!selectedOrder && !isStatusModalOpen}
                onCancel={() => setSelectedOrder(null)}
                footer={[
                    <Button key="close" type="primary" onClick={() => setSelectedOrder(null)}>
                        Đóng
                    </Button>
                ]}
                width={800}
            >
                {selectedOrder && (
                    <div style={{marginTop: 16}} className={detailLoading ? "text-center py-4" : ""}>
                        {detailLoading ? (
                            <span>Đang tải thông tin...</span>
                        ) : (
                            <>
                                <Descriptions title="Thông tin khách hàng" bordered column={{xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1}}>
                                    <Descriptions.Item label="Họ tên">{selectedOrder.full_name}</Descriptions.Item>
                                    <Descriptions.Item label="Điện thoại">{selectedOrder.phone_number}</Descriptions.Item>
                                    <Descriptions.Item label="Email">{selectedOrder.email}</Descriptions.Item>
                                    <Descriptions.Item label="Giới tính">{selectedOrder.gender === "male" ? "Nam" : selectedOrder.gender === "female" ? "Nữ" : "Khác"}</Descriptions.Item>
                                    <Descriptions.Item label="Địa chỉ" span={2}>{selectedOrder.address || "Chưa cung cấp"}</Descriptions.Item>
                                    <Descriptions.Item label="Ghi chú thêm" span={2}>{selectedOrder.note || "Không có"}</Descriptions.Item>
                                </Descriptions>

                                <Divider style={{margin: "20px 0"}} />

                                <Descriptions title="Thông tin chuyến đi" bordered column={{xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1}}>
                                    <Descriptions.Item label="Tour đặt" span={2}>{selectedOrder.tour_name}</Descriptions.Item>
                                    <Descriptions.Item label="Thời gian">{selectedOrder.num_day ? `${selectedOrder.num_day} ngày ${selectedOrder.num_night} đêm` : ""}</Descriptions.Item>
                                    <Descriptions.Item label="Ngày khởi hành">{selectedOrder.departure_date ? new Date(selectedOrder.departure_date).toLocaleDateString("vi-VN") : ""}</Descriptions.Item>
                                    <Descriptions.Item label="Trạng thái đơn">
                                        <Tag color={(statusTags[selectedOrder.status] || {}).color}>
                                            {(statusTags[selectedOrder.status] || {}).text || selectedOrder.status}
                                        </Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Tổng tiền thanh toán">
                                        <span className="text-danger fw-bold fs-5">{formatVnd(selectedOrder.total_price)}</span>
                                    </Descriptions.Item>
                                </Descriptions>

                                {orderDetails.length > 0 && (
                                    <>
                                        <Divider style={{margin: "20px 0"}} />
                                        <div className="ant-descriptions-title" style={{marginBottom: 12}}>Số lượng hành khách</div>
                                        <Table
                                            rowKey="target_type"
                                            pagination={false}
                                            size="small"
                                            dataSource={orderDetails}
                                            columns={[
                                                {
                                                    title: "Nhóm khách",
                                                    dataIndex: "target_type",
                                                    key: "target_type",
                                                    render: (type) => type === "adult" ? "Người lớn" : type === "child" ? "Trẻ em" : "Em bé",
                                                },
                                                {
                                                    title: "Số lượng",
                                                    dataIndex: "quantity",
                                                    key: "quantity",
                                                    align: "center",
                                                }
                                            ]}
                                        />
                                    </>
                                )}
                            </>
                        )}
                    </div>
                )}
            </Modal>

            {/* Quick Status Edit Modal */}
            <Modal
                title={`Cập nhật trạng thái đơn #ODR-${String(selectedOrder?.id || "").padStart(5, "0")}`}
                open={isStatusModalOpen}
                onCancel={() => setIsStatusModalOpen(false)}
                onOk={handleUpdateStatus}
                confirmLoading={updating}
                okText="Cập nhật"
                cancelText="Hủy"
            >
                <div style={{margin: "20px 0"}}>
                    <div style={{marginBottom: 8}}>Chọn trạng thái đơn hàng mới:</div>
                    <Select
                        style={{width: "100%"}}
                        value={updateStatus}
                        onChange={setUpdateStatus}
                        options={[
                            {value: "pending", label: "Chờ xử lý (Pending)"},
                            {value: "confirmed", label: "Đã xác nhận thanh toán (Confirmed)"},
                            {value: "cancelled", label: "Đã hủy đơn (Cancelled)"},
                        ]}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default AdminOrders;
