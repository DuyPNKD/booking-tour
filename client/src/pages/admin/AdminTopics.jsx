import React, {useEffect, useState} from "react";
import {Modal, Input, Popconfirm, message, Tag, Select} from "antd";
import {adminApi} from "../../utils/adminApi";

const statusColors = {
    active: "green",
    inactive: "red",
};

const PAGE_SIZE = 10;

const AdminTopics = () => {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTopic, setEditingTopic] = useState(null);
    const [form, setForm] = useState({name: "", slug: "", status: "active"});
    const [pagination, setPagination] = useState({current: 1, total: 0});

    // Load topics from API
    const loadTopics = async (page = 1) => {
        setLoading(true);
        try {
            const {data} = await adminApi.get("/topics");
            setTopics(data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
            setPagination({
                current: page,
                total: data.length,
            });
        } catch (e) {
            message.error("Không tải được danh sách chủ đề");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTopics(1);
    }, []);

    const showAddModal = () => {
        setEditingTopic(null);
        setForm({name: "", slug: "", status: "active"});
        setModalVisible(true);
    };

    const showEditModal = (topic) => {
        setEditingTopic(topic);
        setForm({
            name: topic.name,
            slug: topic.slug,
            status: topic.status || "active",
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
            setForm({name: "", slug: "", status: "active"});
            setEditingTopic(null);
            loadTopics(pagination.current);
        } catch (e) {
            message.error(e.response?.data?.message || "Lỗi thao tác chủ đề");
        }
    };

    const handleDelete = async (id) => {
        try {
            await adminApi.delete(`/topics/${id}`);
            message.success("Đã xóa chủ đề");
            // Nếu xóa hết trang hiện tại thì lùi về trang trước
            const nextPage = topics.length === 1 && pagination.current > 1 ? pagination.current - 1 : pagination.current;
            loadTopics(nextPage);
        } catch (e) {
            message.error(e.response?.data?.message || "Xóa chủ đề thất bại");
        }
    };

    // Table columns
    const columns = [
        {title: "#", dataIndex: "index", key: "index", width: 60, align: "center"},
        {title: "ID", dataIndex: "id", key: "id", width: 80, align: "center"},
        {title: "Tên chủ đề", dataIndex: "name", key: "name", render: (v) => <span className="fw-medium">{v}</span>},
        {title: "Slug", dataIndex: "slug", key: "slug", render: (v) => <span className="text-muted">{v}</span>},
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            align: "center",
            render: (status) =>
                status === "active" ? (
                    <span
                        className="badge"
                        style={{
                            backgroundColor: "#43a047",
                            color: "#fff",
                            fontSize: "1rem",
                            padding: "0.5em 1.2em",
                            borderRadius: "1.5em",
                            fontWeight: 600,
                            letterSpacing: 1,
                        }}
                    >
                        <i className="fa-solid fa-circle-check me-1"></i> Active
                    </span>
                ) : (
                    <span
                        className="badge"
                        style={{
                            backgroundColor: "#bdbdbd",
                            color: "#333",
                            fontSize: "1rem",
                            padding: "0.5em 1.2em",
                            borderRadius: "1.5em",
                            fontWeight: 600,
                            letterSpacing: 1,
                        }}
                    >
                        <i className="fa-solid fa-circle-xmark me-1"></i> Inactive
                    </span>
                ),
        },
        {
            title: "Hành động",
            key: "action",
            align: "center",
            render: (_, record) => (
                <div className="d-flex flex-wrap justify-content-center gap-2">
                    <button
                        className="btn btn-sm btn-outline-primary"
                        style={{
                            color: "#2196f3",
                            borderColor: "#2196f3",
                            minWidth: 70,
                            background: "none",
                            transition: "background 0.2s, color 0.2s",
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = "#2196f3";
                            e.currentTarget.style.color = "#fff";
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = "none";
                            e.currentTarget.style.color = "#2196f3";
                        }}
                        onClick={() => showEditModal(record)}
                    >
                        <i className="fa-solid fa-pen me-1"></i> Sửa
                    </button>
                    <Popconfirm title="Bạn chắc chắn muốn xóa?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
                        <button
                            className="btn btn-sm btn-outline-danger"
                            style={{
                                color: "#e53935",
                                borderColor: "#e53935",
                                minWidth: 70,
                                background: "none",
                                transition: "background 0.2s, color 0.2s",
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = "#e53935";
                                e.currentTarget.style.color = "#fff";
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = "none";
                                e.currentTarget.style.color = "#e53935";
                            }}
                        >
                            <i className="fa-solid fa-trash me-1"></i> Xóa
                        </button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    // Render table rows
    const renderRows = () =>
        topics.map((topic, idx) => (
            <tr key={topic.id}>
                <td className="text-center text-muted">{(pagination.current - 1) * PAGE_SIZE + idx + 1}</td>
                <td className="text-center text-muted">{topic.id}</td>
                <td className="fw-medium">{topic.name}</td>
                <td className="text-muted">{topic.slug}</td>
                <td className="text-center">
                    {topic.status === "active" ? (
                        <span
                            className="badge"
                            style={{
                                backgroundColor: "#e8f5e9",
                                color: "#2e7d32",
                                fontSize: "0.813rem",
                                padding: "0.4em 0.9em",
                                borderRadius: "0.375rem",
                                fontWeight: 500,
                                border: "1px solid #c8e6c9",
                            }}
                        >
                            <i className="fa-solid fa-circle-check me-1"></i> Active
                        </span>
                    ) : (
                        <span
                            className="badge"
                            style={{
                                backgroundColor: "#fafafa",
                                color: "#616161",
                                fontSize: "0.813rem",
                                padding: "0.4em 0.9em",
                                borderRadius: "0.375rem",
                                fontWeight: 500,
                                border: "1px solid #e0e0e0",
                            }}
                        >
                            <i className="fa-solid fa-circle-xmark me-1"></i> Inactive
                        </span>
                    )}
                </td>
                <td className="text-center">
                    <div className="d-flex flex-wrap justify-content-center gap-2">
                        <button
                            className="btn btn-sm btn-outline-primary"
                            style={{
                                color: "#2196f3",
                                borderColor: "#2196f3",
                                minWidth: 70,
                                background: "none",
                                transition: "background 0.2s, color 0.2s",
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = "#2196f3";
                                e.currentTarget.style.color = "#fff";
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = "none";
                                e.currentTarget.style.color = "#2196f3";
                            }}
                            onClick={() => showEditModal(topic)}
                        >
                            <i className="fa-solid fa-pen me-1"></i> Sửa
                        </button>
                        <Popconfirm title="Bạn chắc chắn muốn xóa?" onConfirm={() => handleDelete(topic.id)} okText="Xóa" cancelText="Hủy">
                            <button
                                className="btn btn-sm btn-outline-danger"
                                style={{
                                    color: "#e53935",
                                    borderColor: "#e53935",
                                    minWidth: 70,
                                    background: "none",
                                    transition: "background 0.2s, color 0.2s",
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = "#e53935";
                                    e.currentTarget.style.color = "#fff";
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = "none";
                                    e.currentTarget.style.color = "#e53935";
                                }}
                            >
                                <i className="fa-solid fa-trash me-1"></i> Xóa
                            </button>
                        </Popconfirm>
                    </div>
                </td>
            </tr>
        ));

    // Pagination
    const totalPages = Math.ceil(pagination.total / PAGE_SIZE);
    const goPage = (p) => {
        if (p < 1 || p > totalPages) return;
        loadTopics(p);
    };

    return (
        <div className="container-fluid">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-2 mb-3">
                <h5 className="mb-0">Quản lý Chủ đề</h5>
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-primary d-inline-flex align-items-center gap-2 text-nowrap py-2"
                        onClick={showAddModal}
                        style={{overflow: "visible"}}
                    >
                        <i className="fa-solid fa-plus"></i>
                        <span>Thêm chủ đề</span>
                    </button>
                </div>
            </div>
            <div className="card">
                {loading ? (
                    <div className="p-4 text-center text-muted">Đang tải...</div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0 table-bordered table-striped" style={{tableLayout: "fixed"}}>
                            <thead className="table-light">
                                <tr>
                                    {columns.map((col) => (
                                        <th
                                            key={col.key}
                                            className={col.align ? `text-${col.align}` : ""}
                                            style={col.width ? {width: col.width} : {}}
                                        >
                                            {col.title}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {topics.length > 0 ? (
                                    renderRows()
                                ) : (
                                    <tr>
                                        <td colSpan={columns.length} className="text-center text-muted py-4">
                                            Không có chủ đề nào
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="card-footer d-flex justify-content-between align-items-center">
                        <div className="text-muted small">
                            Trang {pagination.current}/{totalPages} • Tổng {pagination.total} chủ đề
                        </div>
                        <ul className="pagination mb-0">
                            <li className={`page-item ${pagination.current === 1 ? "disabled" : ""}`}>
                                <button className="page-link" aria-label="Previous" onClick={() => goPage(pagination.current - 1)}>
                                    <span aria-hidden="true">&laquo;</span>
                                </button>
                            </li>
                            {(() => {
                                const pages = [];
                                const current = pagination.current;
                                const total = totalPages;
                                const maxVisible = 5;
                                let start = Math.max(1, current - 2);
                                let end = Math.min(total, start + maxVisible - 1);
                                start = Math.max(1, end - maxVisible + 1);
                                if (start > 1) {
                                    pages.push(
                                        <li key={1} className={`page-item ${current === 1 ? "active" : ""}`}>
                                            <button className="page-link" onClick={() => goPage(1)}>
                                                1
                                            </button>
                                        </li>
                                    );
                                    if (start > 2)
                                        pages.push(
                                            <li key="start-ellipsis" className="page-item disabled">
                                                <span className="page-link">…</span>
                                            </li>
                                        );
                                }
                                for (let p = start; p <= end; p++) {
                                    pages.push(
                                        <li key={p} className={`page-item ${p === current ? "active" : ""}`}>
                                            <button className="page-link" onClick={() => goPage(p)}>
                                                {p}
                                            </button>
                                        </li>
                                    );
                                }
                                if (end < total) {
                                    if (end < total - 1)
                                        pages.push(
                                            <li key="end-ellipsis" className="page-item disabled">
                                                <span className="page-link">…</span>
                                            </li>
                                        );
                                    pages.push(
                                        <li key={total} className={`page-item ${current === total ? "active" : ""}`}>
                                            <button className="page-link" onClick={() => goPage(total)}>
                                                {total}
                                            </button>
                                        </li>
                                    );
                                }
                                return pages;
                            })()}
                            <li className={`page-item ${pagination.current === totalPages ? "disabled" : ""}`}>
                                <button className="page-link" aria-label="Next" onClick={() => goPage(pagination.current + 1)}>
                                    <span aria-hidden="true">&raquo;</span>
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
            {/* Modal */}
            <div
                className={`modal fade ${modalVisible ? "show d-block" : ""}`}
                tabIndex="-1"
                role="dialog"
                style={{background: modalVisible ? "rgba(0,0,0,.5)" : "transparent"}}
            >
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h6 className="modal-title mb-0">{editingTopic ? "Sửa chủ đề" : "Thêm chủ đề"}</h6>
                            <button type="button" className="btn-close" onClick={() => setModalVisible(false)}></button>
                        </div>
                        <div className="modal-body">
                            <Input
                                placeholder="Tên chủ đề"
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
                                style={{marginBottom: 12}}
                            />
                            <Input
                                placeholder="Slug"
                                value={form.slug}
                                onChange={(e) => setForm((prev) => ({...prev, slug: e.target.value}))}
                                style={{marginBottom: 12}}
                            />
                            <Select
                                value={form.status}
                                onChange={(status) => setForm((prev) => ({...prev, status}))}
                                style={{width: "100%"}}
                                options={[
                                    {value: "active", label: "active"},
                                    {value: "inactive", label: "inactive"},
                                ]}
                            />
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-outline-secondary" onClick={() => setModalVisible(false)}>
                                Hủy
                            </button>
                            <button type="button" className="btn btn-primary" onClick={handleOk}>
                                <i className="fa-solid fa-save me-1"></i>
                                {editingTopic ? "Lưu" : "Thêm"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTopics;
