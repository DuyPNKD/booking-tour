import React, {useEffect, useState} from "react";
import {Card, Row, Col, Table, Tag, Button, Spin, Typography, List} from "antd";
import {
    ReloadOutlined,
    CompassOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    DollarOutlined,
    RightOutlined,
    LineChartOutlined,
    TagsOutlined,
    SettingOutlined
} from "@ant-design/icons";
import {useNavigate} from "react-router-dom";
import {adminApi} from "../../utils/adminApi";

const {Title, Text} = Typography;

const formatVnd = (v) => new Intl.NumberFormat("vi-VN", {style: "currency", currency: "VND"}).format(v);

const statusTags = {
    pending: { color: "warning", text: "Chờ xử lý" },
    confirmed: { color: "success", text: "Đã thanh toán" },
    cancelled: { color: "error", text: "Đã hủy" },
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        toursCount: 0,
        bookingsCount: 0,
        usersCount: 0,
        totalRevenue: 0,
        recentBookings: []
    });

    const fetchStats = async () => {
        setLoading(true);
        try {
            const {data} = await adminApi.get("/dashboard/stats");
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error("Error loading dashboard stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const statCards = [
        {
            key: "tours",
            title: "Tổng Số Tour",
            value: stats.toursCount,
            icon: <CompassOutlined style={{ fontSize: "24px", color: "#1890ff" }} />,
            bg: "#e6f7ff",
            link: "/admin/tours"
        },
        {
            key: "orders",
            title: "Tổng Số Đơn Hàng",
            value: stats.bookingsCount,
            icon: <ShoppingCartOutlined style={{ fontSize: "24px", color: "#722ed1" }} />,
            bg: "#f9f0ff",
            link: "/admin/orders"
        },
        {
            key: "users",
            title: "Khách Hàng Thành Viên",
            value: stats.usersCount,
            icon: <UserOutlined style={{ fontSize: "24px", color: "#52c41a" }} />,
            bg: "#f6ffed",
            link: "/admin/users"
        },
        {
            key: "revenue",
            title: "Doanh Thu Thực Tế",
            value: formatVnd(stats.totalRevenue),
            icon: <DollarOutlined style={{ fontSize: "24px", color: "#faad14" }} />,
            bg: "#fffbe6",
            link: ""
        },
    ];

    const columns = [
        {
            title: "Mã đơn",
            dataIndex: "id",
            key: "id",
            width: 100,
            align: "center",
            render: (id) => <span className="fw-semibold">#ODR-{String(id).padStart(5, "0")}</span>,
        },
        {
            title: "Tour du lịch",
            dataIndex: "tour_name",
            key: "tour_name",
            ellipsis: true,
        },
        {
            title: "Khách hàng",
            dataIndex: "customer_name",
            key: "customer_name",
            render: (name) => <span className="fw-medium">{name}</span>
        },
        {
            title: "Khởi hành",
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
            render: (price) => <span className="text-danger fw-semibold">{formatVnd(price)}</span>,
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
    ];

    const quickLinks = [
        { title: "Quản lý Tours", icon: <CompassOutlined />, link: "/admin/tours", color: "#1890ff" },
        { title: "Quản lý Đơn hàng", icon: <ShoppingCartOutlined />, link: "/admin/orders", color: "#722ed1" },
        { title: "Quản lý Chủ đề", icon: <TagsOutlined />, link: "/admin/topics", color: "#eb2f96" },
        { title: "Quản lý Người dùng", icon: <UserOutlined />, link: "/admin/users", color: "#52c41a" }
    ];

    return (
        <div className="admin-dashboard-page p-3">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div>
                    <Title level={3} style={{ margin: 0 }}>Hệ Thống Quản Trị Booking Tour</Title>
                    <Text type="secondary">Trang tổng quan thống kê số liệu hoạt động kinh doanh</Text>
                </div>
                <Button type="primary" icon={<ReloadOutlined />} onClick={fetchStats} loading={loading}>
                    Làm mới dữ liệu
                </Button>
            </div>

            <Spin spinning={loading} tip="Đang tải dữ liệu...">
                {/* Statistics Cards */}
                <Row gutter={[16, 16]} className="mb-4">
                    {statCards.map((card) => (
                        <Col xs={24} sm={12} xl={6} key={card.key}>
                            <Card 
                                hoverable={!!card.link}
                                className="shadow-sm border-0"
                                onClick={() => card.link && navigate(card.link)}
                                style={{ borderRadius: "8px", cursor: card.link ? "pointer" : "default" }}
                            >
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <Text type="secondary" className="d-block mb-1 text-uppercase fw-semibold" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
                                            {card.title}
                                        </Text>
                                        <span className="fs-4 fw-bold text-dark">{card.value}</span>
                                    </div>
                                    <div 
                                        className="d-flex align-items-center justify-content-center"
                                        style={{ 
                                            width: "50px", 
                                            height: "50px", 
                                            borderRadius: "10px", 
                                            backgroundColor: card.bg 
                                        }}
                                    >
                                        {card.icon}
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <Row gutter={[16, 16]}>
                    {/* Recent Bookings Table */}
                    <Col xs={24} lg={17}>
                        <Card 
                            title={<span className="fw-bold">Đơn đặt tour gần đây</span>} 
                            className="shadow-sm border-0"
                            style={{ borderRadius: "8px" }}
                            extra={
                                <Button type="link" icon={<RightOutlined />} onClick={() => navigate("/admin/orders")}>
                                    Xem tất cả đơn
                                </Button>
                            }
                        >
                            <Table
                                rowKey="id"
                                columns={columns}
                                dataSource={stats.recentBookings || []}
                                pagination={false}
                                size="middle"
                                scroll={{ x: "max-content" }}
                                locale={{ emptyText: "Không có đơn hàng nào gần đây" }}
                            />
                        </Card>
                    </Col>

                    {/* Quick Access Menu */}
                    <Col xs={24} lg={7}>
                        <Card 
                            title={<span className="fw-bold">Liên kết nhanh</span>} 
                            className="shadow-sm border-0"
                            style={{ borderRadius: "8px" }}
                        >
                            <List
                                grid={{ gutter: 12, column: 1 }}
                                dataSource={quickLinks}
                                renderItem={(item) => (
                                    <List.Item style={{ margin: "4px 0" }}>
                                        <Button 
                                            type="text" 
                                            block 
                                            onClick={() => navigate(item.link)}
                                            style={{ 
                                                height: "48px", 
                                                display: "flex", 
                                                alignItems: "center", 
                                                justifyContent: "flex-start",
                                                borderRadius: "6px",
                                                border: "1px solid #f0f0f0"
                                            }}
                                        >
                                            <span 
                                                className="d-flex align-items-center justify-content-center me-3" 
                                                style={{ 
                                                    width: "32px", 
                                                    height: "32px", 
                                                    borderRadius: "8px", 
                                                    backgroundColor: `${item.color}15`, 
                                                    color: item.color,
                                                    fontSize: "16px"
                                                }}
                                            >
                                                {item.icon}
                                            </span>
                                            <span className="fw-medium text-dark">{item.title}</span>
                                            <RightOutlined style={{ marginLeft: "auto", fontSize: "12px", color: "#bfbfbf" }} />
                                        </Button>
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>
                </Row>
            </Spin>
        </div>
    );
};

export default AdminDashboard;
