import React, {useEffect, useState} from "react";
import {Card, Table, Modal, Form, Input, Button, Popconfirm, message, Tag, Select, Switch, Space} from "antd";
import {PlusOutlined, EditOutlined, DeleteOutlined, StarFilled, StarOutlined} from "@ant-design/icons";
import {adminApi} from "../../utils/adminApi";

const PAGE_SIZE = 10;

const AdminTopics = () => {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTopic, setEditingTopic] = useState(null);
    const [form, setForm] = useState({name: "", slug: "", status: "active", is_feature: false});
    const [pagination, setPagination] = useState({current: 1, total: 0});
    const [featuredTopics, setFeaturedTopics] = useState([]);

    // Load featured topics from API
    const loadFeaturedTopics = async () => {
        try {
            const {data} = await adminApi.get("/topics/feature");
            setFeaturedTopics(data || []);
        } catch (e) {
            setFeaturedTopics([]);
        }
    };

    // Load topics from API
    const loadTopics = async (page = 1) => {
        setLoading(true);
        try {
            const {data} = await adminApi.get("/topics");
            const rawData = data || [];
            setTopics(rawData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
            setPagination({
                current: page,
                total: rawData.length,
            });
        } catch (e) {
            message.error("Không tải được danh sách chủ đề");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTopics(1);
        loadFeaturedTopics();
    }, []);

    const showAddModal = () => {
        setEditingTopic(null);
        setForm({name: "", slug: "", status: "active", is_feature: false});
        setModalVisible(true);
    };

    const showEditModal = (topic) => {
        setEditingTopic(topic);
        setForm({
            name: topic.name,
            slug: topic.slug,
            status: topic.status || "active",
            is_feature: !!topic.is_feature,
        });
        setModalVisible(true);
    };

    const handleOk = async () => {
        if (!form.name.trim() || !form.slug.trim()) {
            message.error("Vui lòng nhập tên và slug");
            return;
        }
        try {
            if (editingTopic) {
                await adminApi.put(`/topics/${editingTopic.id}`, form);
                message.success("Cập nhật chủ đề thành công");
            } else {
                await adminApi.post("/topics", form);
                message.success("Thêm chủ đề thành công");
            }
            setModalVisible(false);
            setForm({name: "", slug: "", status: "active", is_feature: false});
            setEditingTopic(null);
            loadTopics(pagination.current);
            loadFeaturedTopics();
        } catch (e) {
            message.error(e.response?.data?.message || "Lỗi thao tác chủ đề");
        }
    };

    const handleDelete = async (id) => {
        try {
            await adminApi.delete(`/topics/${id}`);
            message.success("Đã xóa chủ đề");
            const nextPage = topics.length === 1 && pagination.current > 1 ? pagination.current - 1 : pagination.current;
            loadTopics(nextPage);
            loadFeaturedTopics();
        } catch (e) {
            message.error(e.response?.data?.message || "Xóa chủ đề thất bại");
        }
    };

    // Toggle feature status
    const handleToggleFeature = async (topic) => {
        const id = topic.id;
        const newValue = !topic.is_feature;
        try {
            if (newValue) {
                await adminApi.post(`/topics/${id}/feature`);
                message.success("Đã bật hiển thị trang chủ");
            } else {
                await adminApi.delete(`/topics/${id}/feature`);
                message.success("Đã tắt hiển thị trang chủ");
            }
            loadTopics(pagination.current);
            loadFeaturedTopics();
        } catch (e) {
            message.error("Không thể cập nhật trạng thái hiển thị trang chủ");
        }
    };

    // Table columns
    const columns = [
        {
            title: "#",
            key: "index",
            width: 60,
            align: "center",
            render: (_, __, idx) => (pagination.current - 1) * PAGE_SIZE + idx + 1,
        },
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 80,
            align: "center",
        },
        {
            title: "Tên chủ đề",
            dataIndex: "name",
            key: "name",
            render: (v) => <span className="fw-medium">{v}</span>,
        },
        {
            title: "Slug",
            dataIndex: "slug",
            key: "slug",
            render: (v) => <span className="text-muted">{v}</span>,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            align: "center",
            width: 140,
            render: (status) => (
                <Tag color={status === "active" ? "success" : "default"}>
                    {status === "active" ? "Active" : "Inactive"}
                </Tag>
            ),
        },
        {
            title: "Hiển thị trang chủ",
            dataIndex: "is_feature",
            key: "is_feature",
            align: "center",
            width: 180,
            render: (v, record) => (
                <Switch
                    checked={!!v}
                    onChange={() => handleToggleFeature(record)}
                    checkedChildren={<StarFilled style={{color: "#fbc02d"}} />}
                    unCheckedChildren={<StarOutlined style={{color: "#bdbdbd"}} />}
                />
            ),
        },
        {
            title: "Hành động",
            key: "action",
            align: "center",
            width: 180,
            render: (_, record) => (
                <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => showEditModal(record)}>
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn chắc chắn muốn xóa chủ đề này?"
                        okText="Xóa"
                        cancelText="Hủy"
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Button size="small" danger icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="admin-topics-page p-3">
            <Card className="shadow-sm mb-3">
                {/* Featured Topics Section */}
                <div className="mb-4">
                    <h6 className="fw-semibold text-secondary mb-2">Chủ đề hiển thị trên trang chủ:</h6>
                    {featuredTopics.length > 0 ? (
                        <Space wrap>
                            {featuredTopics.map((topic) => (
                                <Tag
                                    key={topic.id}
                                    color="warning"
                                    style={{
                                        fontSize: "0.95rem",
                                        padding: "4px 12px",
                                        borderRadius: "16px",
                                        fontWeight: 600,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px"
                                    }}
                                >
                                    <StarFilled style={{color: "#fbc02d"}} />
                                    {topic.name}
                                </Tag>
                            ))}
                        </Space>
                    ) : (
                        <span className="text-muted small">Không có chủ đề nào được bật hiển thị trang chủ.</span>
                    )}
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">Quản lý Chủ đề</h5>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={showAddModal}
                    >
                        Thêm chủ đề
                    </Button>
                </div>

                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={topics}
                    loading={loading}
                    scroll={{ x: "max-content" }}
                    pagination={{
                        current: pagination.current,
                        pageSize: PAGE_SIZE,
                        total: pagination.total,
                        showSizeChanger: false,
                        showTotal: (total) => `Tổng số: ${total} chủ đề`,
                        onChange: (page) => loadTopics(page),
                    }}
                />
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                title={editingTopic ? "Sửa chủ đề" : "Thêm chủ đề mới"}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={handleOk}
                okText={editingTopic ? "Lưu" : "Thêm"}
                cancelText="Hủy"
            >
                <Form layout="vertical" style={{marginTop: 16}}>
                    <Form.Item label="Tên chủ đề" required>
                        <Input
                            placeholder="Nhập tên chủ đề"
                            value={form.name}
                            onChange={(e) => {
                                const name = e.target.value;
                                setForm((prev) => ({
                                    ...prev,
                                    name,
                                    slug:
                                        prev.slug ||
                                        name
                                            .toLowerCase()
                                            .normalize("NFD")
                                            .replace(/[\u0300-\u036f]/g, "")
                                            .replace(/đ/g, "d")
                                            .replace(/[^a-z0-9]+/g, "-")
                                            .replace(/^-+|-+$/g, ""),
                                }));
                            }}
                        />
                    </Form.Item>

                    <Form.Item label="Slug" required>
                        <Input
                            placeholder="Nhập slug (vd: tin-tuc)"
                            value={form.slug}
                            onChange={(e) => setForm((prev) => ({...prev, slug: e.target.value}))}
                        />
                    </Form.Item>

                    <Form.Item label="Trạng thái">
                        <Select
                            value={form.status}
                            onChange={(status) => setForm((prev) => ({...prev, status}))}
                            options={[
                                {value: "active", label: "Active"},
                                {value: "inactive", label: "Inactive"},
                            ]}
                        />
                    </Form.Item>

                    <Form.Item label="Tùy chọn hiển thị">
                        <Space align="center">
                            <Switch
                                checked={form.is_feature}
                                onChange={(checked) => setForm((prev) => ({...prev, is_feature: checked}))}
                            />
                            <span>Hiển thị ở trang chủ</span>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminTopics;
