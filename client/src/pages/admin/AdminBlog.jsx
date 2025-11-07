import React, {useEffect, useState} from "react";
import {Card, Table, Modal, Form, Input, Button as AntButton, Upload, Select, Popconfirm, message} from "antd";
import {PlusOutlined, UploadOutlined} from "@ant-design/icons";
import {adminApi} from "../../utils/adminApi";
import "./AdminBlog.css";

const {Option} = Select;
const {TextArea} = Input;

const CATEGORY_OPTIONS = ["Tin du lịch", "Kinh nghiệm", "Ẩm thực", "Dịch vụ visa", "Khuyến mãi"];

// Format date from ISO string to Vietnamese format (DD/MM/YYYY)
const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // Return original if invalid
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    } catch (error) {
        return dateString; // Return original if error
    }
};

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const AdminBlog = () => {
    const [form] = Form.useForm();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [uploadPreview, setUploadPreview] = useState("");
    const [uploadFile, setUploadFile] = useState(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // Load blogs from API
    const loadBlogs = async (page = 1, search = "", pageSize = 10) => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: pageSize,
            };
            if (search.trim()) {
                params.q = search.trim();
            }
            const {data} = await adminApi.get("/blogs", {params});
            if (data.success) {
                setPosts(data.data.result || []);
                setPagination({
                    current: data.data.pagination.currentPage,
                    pageSize: data.data.pagination.totalItemsPerPage,
                    total: data.data.pagination.totalItems,
                });
            }
        } catch (error) {
            console.error("Error loading blogs:", error);
            message.error(error.response?.data?.message || "Không thể tải danh sách bài viết");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBlogs(1, "", 10);
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            loadBlogs(1, searchText, pagination.pageSize || 10);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchText]);

    const columns = [
        {
            title: "Ảnh",
            dataIndex: "image",
            key: "image",
            width: 110,
            render: (url) =>
                url ? (
                    <img src={url} alt="thumb" className="rounded img-thumbnail" style={{width: 84, height: 56, objectFit: "cover"}} />
                ) : (
                    <div className="rounded img-thumbnail d-flex align-items-center justify-content-center bg-light" style={{width: 84, height: 56}}>
                        <span className="text-muted small">No image</span>
                    </div>
                ),
        },
        {
            title: "Tiêu đề",
            dataIndex: "title",
            key: "title",
            ellipsis: true,
        },
        {
            title: "Danh mục",
            dataIndex: "category",
            key: "category",
            width: 150,
        },
        {
            title: "Ngày đăng",
            dataIndex: "date",
            key: "date",
            width: 130,
            render: (date) => <span>{formatDate(date)}</span>,
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
        },
        {
            title: "Hành động",
            key: "actions",
            width: 180,
            render: (_, record) => (
                <div className="d-flex gap-2 justify-content-center">
                    <AntButton size="small" onClick={() => onEdit(record)}>
                        Sửa
                    </AntButton>
                    <Popconfirm
                        title="Xóa bài viết"
                        description={`Bạn chắc chắn muốn xóa: ${record.title}?`}
                        okText="Xóa"
                        cancelText="Hủy"
                        onConfirm={() => onDelete(record.id)}
                    >
                        <AntButton danger size="small">
                            Xóa
                        </AntButton>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    function resetModalState() {
        setEditingPost(null);
        setUploadPreview("");
        setUploadFile(null);
        form.resetFields();
    }

    function onAddNew() {
        resetModalState();
        setIsModalOpen(true);
    }

    async function onEdit(post) {
        try {
            // Load full blog detail from API
            const {data} = await adminApi.get(`/blogs/${post.id}`);
            if (data.success) {
                const blog = data.data;
                setEditingPost(blog);
                setIsModalOpen(true);
                setUploadPreview(blog.image || "");
                form.setFieldsValue({
                    title: blog.title,
                    category: blog.category,
                    image: blog.image,
                    description: blog.description,
                    content: blog.content,
                });
            }
        } catch (error) {
            message.error(error.response?.data?.message || "Không thể tải chi tiết bài viết");
        }
    }

    async function onDelete(id) {
        try {
            const {data} = await adminApi.delete(`/blogs/${id}`);
            if (data.success) {
                message.success(data.message || "Đã xóa bài viết");
                loadBlogs(pagination.current, searchText, pagination.pageSize);
            }
        } catch (error) {
            message.error(error.response?.data?.message || "Lỗi khi xóa bài viết");
        }
    }

    function handleModalCancel() {
        setIsModalOpen(false);
        resetModalState();
    }

    async function handleSave() {
        try {
            const values = await form.validateFields();

            // Prepare FormData if there's a file to upload
            const formData = new FormData();
            formData.append("title", values.title);
            formData.append("category", values.category);
            // Set date to today if creating new post, otherwise format existing date
            let dateValue = getTodayDate();
            if (editingPost && editingPost.date) {
                // Format date from ISO string or date object to YYYY-MM-DD
                try {
                    const date = new Date(editingPost.date);
                    if (!isNaN(date.getTime())) {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, "0");
                        const day = String(date.getDate()).padStart(2, "0");
                        dateValue = `${year}-${month}-${day}`;
                    } else if (typeof editingPost.date === "string" && editingPost.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                        // Already in YYYY-MM-DD format
                        dateValue = editingPost.date;
                    }
                } catch (error) {
                    // If parsing fails, use today's date
                    dateValue = getTodayDate();
                }
            }
            formData.append("date", dateValue);
            formData.append("description", values.description || "");
            formData.append("content", values.content);

            // If there's a file, append it; otherwise use image URL
            if (uploadFile) {
                formData.append("image", uploadFile);
            } else {
                formData.append("image", uploadPreview || values.image || "");
            }

            if (editingPost) {
                // Update existing blog
                const {data} = await adminApi.put(`/blogs/${editingPost.id}`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
                if (data.success) {
                    message.success(data.message || "Đã cập nhật bài viết");
                    setIsModalOpen(false);
                    resetModalState();
                    loadBlogs(pagination.current, searchText, pagination.pageSize);
                }
            } else {
                // Create new blog
                const {data} = await adminApi.post("/blogs", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
                if (data.success) {
                    message.success(data.message || "Đã thêm bài viết mới");
                    setIsModalOpen(false);
                    resetModalState();
                    loadBlogs(1, searchText, pagination.pageSize);
                }
            }
        } catch (error) {
            message.error(error.response?.data?.message || "Lỗi khi lưu bài viết");
        }
    }

    const uploadProps = {
        maxCount: 1,
        showUploadList: false,
        beforeUpload: () => false,
        onChange: (info) => {
            const file = info.file?.originFileObj || info.file;
            if (!file) return;
            // Store file for upload
            setUploadFile(file);
            // Show preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadPreview(e.target?.result || "");
            };
            reader.readAsDataURL(file);
        },
    };

    return (
        <div className="admin-blog-page">
            <div className="container-fluid px-0">
                <div className="row">
                    <div className="col-12">
                        <Card className=" rounded-3 shadow-sm mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="fw-bold mb-0">Quản lý bài viết</h5>
                                <button className="btn btn-primary" onClick={onAddNew}>
                                    <PlusOutlined className="me-1" /> Thêm bài viết mới
                                </button>
                            </div>

                            <div className="row g-3 align-items-center mb-3">
                                <div className="col-12 col-md-6">
                                    <Input.Search
                                        allowClear
                                        placeholder="Tìm theo tiêu đề..."
                                        onSearch={setSearchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        loading={loading}
                                    />
                                </div>
                            </div>

                            <div className="table-responsive">
                                <Table
                                    rowKey="id"
                                    columns={columns}
                                    dataSource={posts}
                                    loading={loading}
                                    pagination={{
                                        current: pagination.current,
                                        pageSize: pagination.pageSize,
                                        total: pagination.total,
                                        showSizeChanger: true,
                                        showTotal: (total) => `Tổng ${total} bài viết`,
                                        onChange: (page, pageSize) => {
                                            loadBlogs(page, searchText, pageSize);
                                        },
                                    }}
                                />
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            <Modal
                title={editingPost ? "Sửa bài viết" : "Thêm bài viết"}
                open={isModalOpen}
                onCancel={handleModalCancel}
                footer={null}
                className="admin-blog-modal rounded-3"
                width={900}
            >
                <Form form={form} layout="vertical" initialValues={{category: CATEGORY_OPTIONS[0]}}>
                    <div className="row">
                        <div className="col-12 col-lg-6">
                            <Form.Item name="title" label="Tiêu đề" rules={[{required: true, message: "Vui lòng nhập tiêu đề"}]}>
                                <Input placeholder="Nhập tiêu đề bài viết" />
                            </Form.Item>

                            <Form.Item name="category" label="Danh mục" rules={[{required: true, message: "Vui lòng chọn danh mục"}]}>
                                <Select placeholder="Chọn danh mục">
                                    {CATEGORY_OPTIONS.map((c) => (
                                        <Option key={c} value={c}>
                                            {c}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item label="Ảnh đại diện">
                                <div className="d-flex align-items-center gap-3">
                                    <Upload {...uploadProps}>
                                        <AntButton icon={<UploadOutlined />}>Chọn ảnh</AntButton>
                                    </Upload>
                                    {(uploadPreview || form.getFieldValue("image")) && (
                                        <img
                                            src={uploadPreview || form.getFieldValue("image")}
                                            alt="preview"
                                            className="img-thumbnail rounded"
                                            style={{width: 120, height: 80, objectFit: "cover"}}
                                        />
                                    )}
                                </div>
                            </Form.Item>

                            <Form.Item name="image" label="Hoặc dán link ảnh">
                                <Input
                                    placeholder="https://..."
                                    onChange={(e) => {
                                        const url = e.target.value;
                                        setUploadPreview(url);
                                        setUploadFile(null); // Clear file if URL is entered
                                    }}
                                />
                            </Form.Item>
                        </div>

                        <div className="col-12 col-lg-6">
                            <Form.Item name="description" label="Mô tả ngắn" rules={[{required: true, message: "Vui lòng nhập mô tả"}]}>
                                <TextArea rows={4} placeholder="Tóm tắt nội dung bài viết" />
                            </Form.Item>

                            <Form.Item name="content" label="Nội dung bài viết" rules={[{required: true, message: "Vui lòng nhập nội dung"}]}>
                                <TextArea rows={10} placeholder="Nội dung chi tiết..." />
                            </Form.Item>
                        </div>
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-2">
                        <button className="btn btn-outline-secondary" type="button" onClick={handleModalCancel}>
                            Hủy
                        </button>
                        <button className="btn btn-success" type="button" onClick={handleSave}>
                            Lưu
                        </button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminBlog;
