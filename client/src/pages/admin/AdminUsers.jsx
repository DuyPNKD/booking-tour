import React, {useState, useEffect} from "react";
import {Table, Button, Input, Modal, Form, Select, Switch, message, Space, Popconfirm, Tag, Card, Row, Col, Typography} from "antd";
import {PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, UserOutlined} from "@ant-design/icons";
import {adminApi} from "../../utils/adminApi";

const {Title} = Typography;
const {Option} = Select;

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // Modal states
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();

    // Fetch users from API
    const fetchUsers = async (params = {}) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: params.current || pagination.current,
                limit: params.pageSize || pagination.pageSize,
                search: searchText,
                role: roleFilter,
                status: statusFilter,
            });

            const response = await adminApi.get(`/users?${queryParams}`);

            if (response.data.success) {
                setUsers(response.data.data);
                setPagination({
                    current: response.data.pagination.current,
                    pageSize: response.data.pagination.pageSize,
                    total: response.data.pagination.total,
                });
            } else {
                message.error(response.data.message || "Lỗi khi tải danh sách người dùng");
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            message.error("Lỗi khi tải danh sách người dùng");
        } finally {
            setLoading(false);
        }
    };

    // Load users on component mount and when filters change
    useEffect(() => {
        fetchUsers();
    }, [searchText, roleFilter, statusFilter]);

    // Handle search
    const handleSearch = (value) => {
        setSearchText(value);
        setPagination((prev) => ({...prev, current: 1}));
    };

    // Handle role filter
    const handleRoleFilter = (value) => {
        setRoleFilter(value);
        setPagination((prev) => ({...prev, current: 1}));
    };

    // Handle status filter
    const handleStatusFilter = (value) => {
        setStatusFilter(value);
        setPagination((prev) => ({...prev, current: 1}));
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchText("");
        setRoleFilter("");
        setStatusFilter("");
        setPagination((prev) => ({...prev, current: 1}));
    };

    // Open modal for adding new user
    const handleAdd = () => {
        setEditingUser(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    // Open modal for editing user
    const handleEdit = (record) => {
        setEditingUser(record);
        form.setFieldsValue({
            name: record.name,
            email: record.email,
            phone: record.phone,
            gender: record.gender,
            address: record.address,
            role: record.role,
            is_active: record.is_active === 1,
        });
        setIsModalVisible(true);
    };

    // Handle modal submit
    const handleModalSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (editingUser) {
                // Update user
                const response = await adminApi.put(`/users/${editingUser.id}`, values);

                if (response.data.success) {
                    message.success("Cập nhật người dùng thành công");
                    fetchUsers();
                } else {
                    message.error(response.data.message || "Lỗi khi cập nhật người dùng");
                }
            } else {
                // Create new user
                const response = await adminApi.post("/users", values);

                if (response.data.success) {
                    message.success("Tạo người dùng thành công");
                    fetchUsers();
                } else {
                    message.error(response.data.message || "Lỗi khi tạo người dùng");
                }
            }

            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            console.error("Error submitting form:", error);
            if (error.response?.data?.message) {
                message.error(error.response.data.message);
            } else {
                message.error("Có lỗi xảy ra khi xử lý yêu cầu");
            }
        }
    };

    // Handle delete user
    const handleDelete = async (id) => {
        try {
            const response = await adminApi.delete(`/users/${id}`);

            if (response.data.success) {
                message.success("Xóa người dùng thành công");
                fetchUsers();
            } else {
                message.error(response.data.message || "Lỗi khi xóa người dùng");
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            if (error.response?.data?.message) {
                message.error(error.response.data.message);
            } else {
                message.error("Có lỗi xảy ra khi xóa người dùng");
            }
        }
    };

    // Table columns configuration
    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 80,
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: "Tên",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone",
            key: "phone",
        },
        {
            title: "Giới tính",
            dataIndex: "gender",
            key: "gender",
            render: (gender) => {
                const genderMap = {
                    male: "Nam",
                    female: "Nữ",
                    other: "Khác",
                };
                return genderMap[gender] || "-";
            },
        },
        {
            title: "Role",
            dataIndex: "role",
            key: "role",
            render: (role) => <Tag color={role === "admin" ? "red" : "blue"}>{role === "admin" ? "Admin" : "User"}</Tag>,
            filters: [
                {text: "Admin", value: "admin"},
                {text: "User", value: "user"},
            ],
            onFilter: (value, record) => record.role === value,
        },
        {
            title: "Trạng thái",
            dataIndex: "is_active",
            key: "is_active",
            render: (is_active) => <Tag color={is_active === 1 ? "green" : "red"}>{is_active === 1 ? "Hoạt động" : "Khóa"}</Tag>,
            filters: [
                {text: "Hoạt động", value: 1},
                {text: "Khóa", value: 0},
            ],
            onFilter: (value, record) => record.is_active === value,
        },
        {
            title: "Ngày tạo",
            dataIndex: "created_at",
            key: "created_at",
            render: (date) => new Date(date).toLocaleDateString("vi-VN"),
            sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <Space size="small">
                    <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa người dùng này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button type="primary" danger size="small" icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{padding: "24px"}}>
            <Card>
                <Row justify="space-between" align="middle" style={{marginBottom: 16}}>
                    <Col>
                        <Title level={4} style={{margin: 0}}>
                            <UserOutlined style={{marginRight: 8}} />
                            Quản lý Người dùng
                        </Title>
                    </Col>
                    <Col>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                            Thêm người dùng
                        </Button>
                    </Col>
                </Row>

                {/* Search and Filter Controls */}
                <Row gutter={16} style={{marginBottom: 16}}>
                    <Col xs={24} sm={8} md={6}>
                        <Input
                            placeholder="Tìm kiếm theo tên, email..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => handleSearch(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={8} md={4}>
                        <Select placeholder="Lọc theo role" value={roleFilter} onChange={handleRoleFilter} style={{width: "100%"}} allowClear>
                            <Option value="admin">Admin</Option>
                            <Option value="user">User</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={8} md={4}>
                        <Select
                            placeholder="Lọc theo trạng thái"
                            value={statusFilter}
                            onChange={handleStatusFilter}
                            style={{width: "100%"}}
                            allowClear
                        >
                            <Option value="active">Hoạt động</Option>
                            <Option value="inactive">Khóa</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={24} md={4}>
                        <Button onClick={clearFilters} style={{width: "100%"}}>
                            Xóa bộ lọc
                        </Button>
                    </Col>
                </Row>

                {/* Users Table */}
                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} người dùng`,
                        onChange: (page, pageSize) => {
                            fetchUsers({current: page, pageSize});
                        },
                    }}
                    scroll={{x: 1000}}
                />
            </Card>

            {/* Add/Edit User Modal */}
            <Modal
                title={editingUser ? "Sửa thông tin người dùng" : "Thêm người dùng mới"}
                open={isModalVisible}
                onOk={handleModalSubmit}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                width={600}
                okText={editingUser ? "Cập nhật" : "Thêm"}
                cancelText="Hủy"
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        role: "user",
                        is_active: true,
                    }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Tên"
                                rules={[
                                    {required: true, message: "Vui lòng nhập tên"},
                                    {min: 2, message: "Tên phải có ít nhất 2 ký tự"},
                                ]}
                            >
                                <Input placeholder="Nhập tên người dùng" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    {required: true, message: "Vui lòng nhập email"},
                                    {type: "email", message: "Email không hợp lệ"},
                                ]}
                            >
                                <Input placeholder="Nhập email" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="phone" label="Số điện thoại">
                                <Input placeholder="Nhập số điện thoại" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="gender" label="Giới tính">
                                <Select placeholder="Chọn giới tính">
                                    <Option value="male">Nam</Option>
                                    <Option value="female">Nữ</Option>
                                    <Option value="other">Khác</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="address" label="Địa chỉ">
                        <Input.TextArea placeholder="Nhập địa chỉ" rows={2} />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="role" label="Vai trò" rules={[{required: true, message: "Vui lòng chọn vai trò"}]}>
                                <Select>
                                    <Option value="user">User</Option>
                                    <Option value="admin">Admin</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="is_active" label="Trạng thái" valuePropName="checked">
                                <Switch checkedChildren="Hoạt động" unCheckedChildren="Khóa" />
                            </Form.Item>
                        </Col>
                    </Row>

                    {!editingUser && (
                        <Form.Item
                            name="password"
                            label="Mật khẩu"
                            rules={[
                                {required: true, message: "Vui lòng nhập mật khẩu"},
                                {min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự"},
                            ]}
                        >
                            <Input.Password placeholder="Nhập mật khẩu" />
                        </Form.Item>
                    )}
                </Form>
            </Modal>
        </div>
    );
};

export default AdminUsers;
