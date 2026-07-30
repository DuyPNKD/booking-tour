import React, {useEffect, useMemo, useRef, useState} from "react";
import {Card, Table, Modal, Form, Input, Button, Upload, Select, Popconfirm, message, Tag, Row, Col, Space, Tabs} from "antd";
import {PlusOutlined, UploadOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, SearchOutlined, ImportOutlined} from "@ant-design/icons";
import {adminApi} from "../../utils/adminApi";
import axios from "axios";

const currency = (v) => new Intl.NumberFormat("vi-VN", {style: "currency", currency: "VND"}).format(v);

const emptyForm = {
    id: null,
    title: "",
    slug: "",
    num_day: "",
    num_night: "",
    location_id: "",
    status: "pending",
    thumbnail_url: "",
    overview_content: "",
    // Prices
    adult_price: "",
    adult_old_price: "",
    adult_min_age: 10,
    adult_max_age: 99,
    child_price: "",
    child_old_price: "",
    child_min_age: 5,
    child_max_age: 9,
    infant_price: "",
    infant_old_price: "",
    infant_min_age: 0,
    infant_max_age: 4,
    // Images (multi-URL, one per line)
    images_text: "",
    // Schedules
    schedules: [{day_order: 1, day_text: "Ngày 1", content: ""}],
    // Departures
    departures: [{departure_city: "Hà Nội", departure_date: "", return_date: "", available_seats: "", price: ""}],
    // Terms
    terms: [{section_title: "Giá tour bao gồm", content: ""}],
    topics: [],
};

const AdminTours = () => {
    const [tours, setTours] = useState([]);
    const [pagination, setPagination] = useState({totalItems: 0, currentPage: 1, totalPages: 1});
    const [search, setSearch] = useState("");
    const [locationId, setLocationId] = useState("");
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [isEdit, setIsEdit] = useState(false);

    const [showImport, setShowImport] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadMsg, setUploadMsg] = useState("");

    const saveTimerRef = useRef(null);
    const [topicOptions, setTopicOptions] = useState([]);
    const limit = 10;

    // Load locations
    const loadLocations = async () => {
        try {
            const {data} = await adminApi.get("/locations");
            setLocations(data || []);
        } catch (e) {
            console.error("Error loading locations:", e);
        }
    };

    // Load tours list
    const loadTours = async (page = 1) => {
        setLoading(true);
        try {
            const params = {page, limit};
            if (search.trim()) params.q = search.trim();
            if (locationId) params.locationId = locationId;
            const {data} = await adminApi.get("/tours", {params});
            setTours(data.result || []);
            setPagination(data.pagination || {totalItems: 0, currentPage: 1, totalPages: 1});
        } catch (e) {
            message.error(e.response?.data?.message || "Tải danh sách tour thất bại");
        } finally {
            setLoading(false);
        }
    };

    // Load topics
    const loadTopics = async () => {
        try {
            const {data} = await adminApi.get("/topics");
            setTopicOptions(data || []);
        } catch (e) {
            console.error("Error loading topics:", e);
            setTopicOptions([]);
        }
    };

    useEffect(() => {
        loadLocations();
    }, []);

    useEffect(() => {
        loadTours(1);
    }, [search, locationId]);

    // Autosave draft draft in Add mode
    useEffect(() => {
        if (isEdit) return;
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            try {
                localStorage.setItem("adminTourForm", JSON.stringify(form));
            } catch (e) {
                console.error("Autosave failed:", e);
            }
        }, 800);

        return () => {
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
                saveTimerRef.current = null;
            }
        };
    }, [form, isEdit]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            if (!isEdit) {
                try {
                    localStorage.setItem("adminTourForm", JSON.stringify(form));
                } catch (e) {}
            }
        };
        const handleVisibilityChange = () => {
            if (document.hidden && !isEdit) {
                try {
                    localStorage.setItem("adminTourForm", JSON.stringify(form));
                } catch (e) {}
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [form, isEdit]);

    // Open add/edit modal
    const openAdd = () => {
        setIsEdit(false);
        const savedForm = localStorage.getItem("adminTourForm");
        if (savedForm) {
            try {
                setForm(JSON.parse(savedForm));
            } catch (e) {
                setForm(emptyForm);
            }
        } else {
            setForm(emptyForm);
        }
        loadTopics();
        setShowModal(true);
    };

    const openEdit = async (t) => {
        try {
            setIsEdit(true);
            loadTopics();
            const {data} = await adminApi.get(`/tours/${t.id}`);
            const images_text = (data.images || []).map((i) => i.image_url).join("\n");
            const prices = data.prices || [];
            const getPrice = (type, field) => {
                const row = prices.find((p) => p.target_type === type);
                if (!row) return "";
                return row[field] ?? "";
            };
            setForm({
                id: data.id,
                title: data.title || "",
                slug: data.slug || "",
                num_day: data.num_day || "",
                num_night: data.num_night || "",
                location_id: data.location_id || "",
                status: data.status || "active",
                thumbnail_url: data.thumbnail_url || "",
                overview_content: data.overview?.content || data.overview || "",
                adult_price: getPrice("adult", "price") || data.price || "",
                adult_old_price: getPrice("adult", "old_price") || data.old_price || "",
                adult_min_age: getPrice("adult", "min_age") || "",
                adult_max_age: getPrice("adult", "max_age") || "",
                child_price: getPrice("child", "price") || "",
                child_old_price: getPrice("child", "old_price") || "",
                child_min_age: getPrice("child", "min_age") || "",
                child_max_age: getPrice("child", "max_age") || "",
                infant_price: getPrice("infant", "price") || "",
                infant_old_price: getPrice("infant", "old_price") || "",
                infant_min_age: getPrice("infant", "min_age") || "",
                infant_max_age: getPrice("infant", "max_age") || "",
                images_text,
                schedules: (data.schedules || []).map((s, idx) => ({
                    day_order: s.day_order ?? idx + 1,
                    day_text: s.day_text || `Ngày ${idx + 1}`,
                    content: s.content || "",
                })),
                departures: (data.departures || []).map((d) => ({
                    departure_city: d.departure_city || "",
                    departure_date: d.departure_date ? String(d.departure_date).slice(0, 10) : "",
                    return_date: d.return_date ? String(d.return_date).slice(0, 10) : "",
                    available_seats: d.available_seats ?? "",
                    price: d.price ?? "",
                })),
                terms: (data.terms || []).map((t) => ({section_title: t.section_title || "", content: t.content || ""})),
                topics: (data.topics || []).map((topic) => topic.id || topic.slug || topic),
            });
            setShowModal(true);
        } catch (e) {
            message.error("Không tải được chi tiết tour");
        }
    };

    const closeModal = () => {
        if (!isEdit) {
            localStorage.setItem("adminTourForm", JSON.stringify(form));
        }
        setShowModal(false);
    };

    // Change fields
    const onChange = (e) => {
        const {name, value} = e.target;
        setForm((prev) => ({...prev, [name]: value}));
    };

    // Schedules methods
    const onChangeSchedule = (index, field, value) => {
        setForm((prev) => {
            const next = {...prev};
            const items = [...(next.schedules || [])];
            items[index] = {...items[index], [field]: value};
            next.schedules = items;
            return next;
        });
    };

    const addSchedule = () => {
        setForm((prev) => ({
            ...prev,
            schedules: [
                ...(prev.schedules || []),
                {day_order: (prev.schedules?.length || 0) + 1, day_text: `Ngày ${(prev.schedules?.length || 0) + 1}`, content: ""},
            ],
        }));
    };

    const removeSchedule = (index) => {
        setForm((prev) => {
            const items = [...(prev.schedules || [])];
            items.splice(index, 1);
            return {...prev, schedules: items};
        });
    };

    // Departures methods
    const onChangeDeparture = (index, field, value) => {
        setForm((prev) => {
            const next = {...prev};
            const items = [...(next.departures || [])];
            items[index] = {...items[index], [field]: value};
            next.departures = items;
            return next;
        });
    };

    const addDeparture = () => {
        setForm((prev) => ({
            ...prev,
            departures: [...(prev.departures || []), {departure_city: "", departure_date: "", return_date: "", available_seats: "", price: ""}],
        }));
    };

    const removeDeparture = (index) => {
        setForm((prev) => {
            const items = [...(prev.departures || [])];
            items.splice(index, 1);
            return {...prev, departures: items};
        });
    };

    // Terms methods
    const onChangeTerm = (index, field, value) => {
        setForm((prev) => {
            const next = {...prev};
            const items = [...(next.terms || [])];
            items[index] = {...items[index], [field]: value};
            next.terms = items;
            return next;
        });
    };

    const addTerm = () => {
        setForm((prev) => ({...prev, terms: [...(prev.terms || []), {section_title: "", content: ""}]}));
    };

    const removeTerm = (index) => {
        setForm((prev) => {
            const items = [...(prev.terms || [])];
            items.splice(index, 1);
            return {...prev, terms: items};
        });
    };

    // Cloudinary Upload Actions
    const handleUploadThumbnailFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        uploadThumbnail(file);
        e.target.value = "";
    };

    const uploadThumbnail = async (file) => {
        try {
            const formData = new FormData();
            formData.append("file", file);
            const token = localStorage.getItem("adminToken");
            const API_BASE = import.meta.env.VITE_API_BASE || "";
            message.loading({content: "Đang tải ảnh đại diện...", key: "upload_thumb"});

            const {data} = await axios.post(`${API_BASE}/api/upload/cloudinary`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: token ? `Bearer ${token}` : undefined,
                },
            });
            if (data?.success && data?.url) {
                setForm((prev) => ({...prev, thumbnail_url: data.url}));
                message.success({content: "Tải ảnh đại diện thành công!", key: "upload_thumb"});
            }
        } catch (err) {
            message.error({content: err.response?.data?.message || "Upload thumbnail thất bại", key: "upload_thumb"});
        }
    };

    const handleUploadDetailImages = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        uploadDetailImages(files);
        e.target.value = "";
    };

    const uploadDetailImages = async (files) => {
        try {
            const formData = new FormData();
            files.forEach((f) => formData.append("files", f));
            const token = localStorage.getItem("adminToken");
            const API_BASE = import.meta.env.VITE_API_BASE || "";
            message.loading({content: "Đang tải các ảnh chi tiết...", key: "upload_gallery"});

            const {data} = await axios.post(`${API_BASE}/api/upload/cloudinary/multiple`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: token ? `Bearer ${token}` : undefined,
                },
            });
            if (data?.success && Array.isArray(data?.files)) {
                const urls = data.files.map((f) => f.url).filter(Boolean);
                const appendText = urls.join("\n");
                setForm((prev) => ({
                    ...prev,
                    images_text: prev.images_text ? `${prev.images_text}\n${appendText}` : appendText,
                }));
                message.success({content: "Tải ảnh chi tiết thành công!", key: "upload_gallery"});
            }
        } catch (err) {
            message.error({content: err.response?.data?.message || "Upload ảnh chi tiết thất bại", key: "upload_gallery"});
        }
    };

    const handleRemoveThumbnail = () => {
        setForm((prev) => ({...prev, thumbnail_url: ""}));
    };

    const handleRemoveGalleryImage = (url) => {
        setForm((prev) => {
            const nextList = (prev.images_text || "")
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean)
                .filter((u) => u !== url);
            return {...prev, images_text: nextList.join("\n")};
        });
    };

    // Build payload to match backend
    const buildTourPayload = (form) => {
        return {
            title: form.title,
            slug: form.slug?.trim()
                ? form.slug
                : form.title
                      ?.trim()
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                      .replace(/[^a-z0-9-]/g, ""),
            num_day: Number(form.num_day || 0),
            num_night: Number(form.num_night || 0),
            price: form.adult_price !== "" ? Number(form.adult_price) : null,
            old_price: form.adult_old_price !== "" ? Number(form.adult_old_price) : null,
            location_id: Number(form.location_id || 0),
            status: form.status,
            topics: form.topics || [],
            thumbnail_url: form.thumbnail_url || null,
            images: (form.images_text || "")
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean)
                .map((u) => ({image_url: u})),
            overview: form.overview_content ? {content: form.overview_content} : null,
            schedules: (form.schedules || [])
                .filter((s) => s.day_text || s.content)
                .map((s, idx) => ({
                    day_text: s.day_text || `Ngày ${idx + 1}`,
                    day_order: s.day_order ? Number(s.day_order) : idx + 1,
                    content: s.content || "",
                })),
            departures: (form.departures || [])
                .filter((d) => d.departure_date)
                .map((d) => ({
                    departure_city: d.departure_city || null,
                    departure_date: d.departure_date,
                    return_date: d.return_date || null,
                    available_seats: d.available_seats !== "" ? Number(d.available_seats) : null,
                    price: d.price !== "" ? Number(d.price) : null,
                })),
            terms: (form.terms || [])
                .filter((t) => t.section_title || t.content)
                .map((t) => ({section_title: t.section_title || "", content: t.content || ""})),
            prices: [
                form.adult_price !== "" || form.adult_old_price !== ""
                    ? {
                          target_type: "adult",
                          min_age: form.adult_min_age !== "" ? Number(form.adult_min_age) : 10,
                          max_age: form.adult_max_age !== "" ? Number(form.adult_max_age) : 99,
                          price: Number(form.adult_price || 0),
                          old_price: form.adult_old_price !== "" ? Number(form.adult_old_price || 0) : null,
                      }
                    : null,
                form.child_price !== "" || form.child_old_price !== ""
                    ? {
                          target_type: "child",
                          min_age: form.child_min_age !== "" ? Number(form.child_min_age) : 5,
                          max_age: form.child_max_age !== "" ? Number(form.child_max_age) : 9,
                          price: Number(form.child_price || 0),
                          old_price: form.child_old_price !== "" ? Number(form.child_old_price || 0) : null,
                      }
                    : null,
                form.infant_price !== "" || form.infant_old_price !== ""
                    ? {
                          target_type: "infant",
                          min_age: form.infant_min_age !== "" ? Number(form.infant_min_age) : 0,
                          max_age: form.infant_max_age !== "" ? Number(form.infant_max_age) : 4,
                          price: Number(form.infant_price || 0),
                          old_price: form.infant_old_price !== "" ? Number(form.infant_old_price || 0) : null,
                      }
                    : null,
            ].filter(Boolean),
        };
    };

    // Validate
    const validateForm = (form) => {
        if (!form.title?.trim()) return "Tên tour không được để trống";
        if (!form.location_id) return "Phải chọn địa điểm";
        if (!form.departures || form.departures.filter(d => d.departure_date).length === 0) return "Phải có ít nhất 1 ngày khởi hành hợp lệ";
        if (!form.topics || form.topics.length === 0) return "Phải chọn ít nhất 1 chủ đề tour";
        return null;
    };

    // Submit
    const onSubmit = async () => {
        const err = validateForm(form);
        if (err) {
            message.error(err);
            return;
        }

        try {
            const payload = buildTourPayload(form);
            if (isEdit) {
                await adminApi.put(`/tours/${form.id}`, payload);
                message.success("Cập nhật tour thành công!");
            } else {
                await adminApi.post("/tours", payload);
                message.success("Thêm tour thành công!");
                try {
                    localStorage.removeItem("adminTourForm");
                } catch (e) {}
                setForm(emptyForm);
                if (saveTimerRef.current) {
                    clearTimeout(saveTimerRef.current);
                    saveTimerRef.current = null;
                }
            }
            setShowModal(false);
            loadTours(pagination.currentPage || 1);
        } catch (e) {
            message.error(e.response?.data?.message || "Lưu tour thất bại");
        }
    };

    // Delete
    const onDelete = async (id) => {
        try {
            await adminApi.delete(`/tours/${id}`);
            message.success("Đã xóa tour thành công!");
            loadTours(pagination.currentPage || 1);
        } catch (e) {
            message.error(e.response?.data?.message || "Xóa tour thất bại");
        }
    };

    // Import from Excel/CSV handler
    const handleImport = async () => {
        if (!importFile) {
            message.error("Vui lòng chọn file");
            return;
        }
        try {
            setUploading(true);
            setUploadMsg("Đang tải lên...");
            const formData = new FormData();
            formData.append("file", importFile);
            const {data} = await adminApi.post("/tours/import", formData, {
                onUploadProgress: (p) => {
                    if (p.total) setUploadMsg(`Đang tải lên ${Math.round((p.loaded / p.total) * 100)}%`);
                },
            });
            setUploadMsg(`Thành công: ${data.success}, Lỗi: ${data.failed}`);
            message.success(`Import thành công: ${data.success} tour, Lỗi: ${data.failed} tour`);
            await loadTours(1);
        } catch (e) {
            setUploadMsg(e.response?.data?.message || "Import thất bại");
            message.error(e.response?.data?.message || "Import thất bại");
        } finally {
            setUploading(false);
        }
    };

    // Ant Design Columns
    const columns = [
        {
            title: "#",
            key: "index",
            width: 60,
            align: "center",
            render: (_, __, idx) => ((pagination.currentPage || 1) - 1) * limit + idx + 1,
        },
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 70,
            align: "center",
        },
        {
            title: "Tên tour",
            dataIndex: "title",
            key: "title",
            ellipsis: true,
        },
        {
            title: "Giá",
            dataIndex: "price",
            key: "price",
            width: 140,
            align: "right",
            render: (price) => currency(price),
        },
        {
            title: "Địa điểm",
            key: "location",
            width: 140,
            render: (_, record) => record.location_name || record.location_id,
        },
        {
            title: "Ngày tạo",
            dataIndex: "created_at",
            key: "created_at",
            width: 120,
            align: "center",
            render: (date) => date ? new Date(date).toLocaleDateString("vi-VN") : "",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 110,
            align: "center",
            render: (status) => {
                let color = "default";
                if (status === "active") color = "success";
                else if (status === "pending") color = "blue";
                else if (status === "paused") color = "warning";
                return <Tag color={color}>{status}</Tag>;
            },
        },
        {
            title: "Hành động",
            key: "actions",
            width: 160,
            align: "center",
            render: (_, record) => (
                <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xóa tour"
                        description={`Bạn chắc chắn muốn xóa tour: ${record.title}?`}
                        okText="Xóa"
                        cancelText="Hủy"
                        onConfirm={() => onDelete(record.id)}
                    >
                        <Button size="small" danger icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // Thumb upload props
    const uploadThumbProps = {
        showUploadList: false,
        beforeUpload: (file) => {
            uploadThumbnail(file);
            return false;
        },
    };

    return (
        <div className="admin-tour-page p-3">
            <Card className="shadow-sm mb-3">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                    <h5 className="fw-bold mb-0">Quản lý Tour</h5>
                    <Space>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => loadTours(pagination.currentPage || 1)}
                            loading={loading}
                        >
                            Tải lại
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={openAdd}
                        >
                            Thêm tour mới
                        </Button>
                        <Button
                            icon={<ImportOutlined />}
                            style={{backgroundColor: "#f3e5f5", borderColor: "#9c27b0", color: "#7b1fa2"}}
                            onClick={() => {
                                setShowImport(true);
                                setImportFile(null);
                                setUploadMsg("");
                            }}
                        >
                            Import Tour
                        </Button>
                    </Space>
                </div>

                <Row gutter={[16, 16]} className="mb-3">
                    <Col xs={24} md={12} lg={8}>
                        <Input.Search
                            allowClear
                            placeholder="Tìm kiếm tour..."
                            enterButton={<SearchOutlined />}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onSearch={() => loadTours(1)}
                        />
                    </Col>
                    <Col xs={24} md={12} lg={6}>
                        <Select
                            allowClear
                            placeholder="Tất cả địa điểm"
                            style={{width: "100%"}}
                            value={locationId || undefined}
                            onChange={(val) => setLocationId(val || "")}
                        >
                            {locations.map((l) => (
                                <Select.Option key={l.id} value={String(l.id)}>
                                    {l.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                </Row>

                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={tours}
                    loading={loading}
                    scroll={{ x: "max-content" }}
                    pagination={{
                        current: pagination.currentPage,
                        pageSize: limit,
                        total: pagination.totalItems,
                        showSizeChanger: false,
                        showTotal: (total) => `Tổng số: ${total} tour`,
                        onChange: (page) => loadTours(page),
                    }}
                />
            </Card>

            {/* Modal Add/Edit */}
            <Modal
                title={isEdit ? "Sửa tour" : "Thêm tour mới"}
                open={showModal}
                onCancel={closeModal}
                width={1100}
                onOk={onSubmit}
                okText={isEdit ? "Lưu thay đổi" : "Thêm tour"}
                cancelText="Hủy"
            >
                <div style={{maxHeight: "68vh", overflowY: "auto", paddingRight: "8px", margin: "16px 0"}}>
                    <Form layout="vertical">
                        <Tabs defaultActiveKey="1" items={[
                            {
                                key: "1",
                                label: "Thông tin chung",
                                children: (
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item label="Tên tour" required>
                                                <Input
                                                    name="title"
                                                    value={form.title}
                                                    onChange={(e) => {
                                                        onChange(e);
                                                        const autoSlug = e.target.value
                                                            ?.trim()
                                                            .toLowerCase()
                                                            .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
                                                            .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
                                                            .replace(/ì|í|ị|ỉ|ĩ/g, "i")
                                                            .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
                                                            .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
                                                            .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
                                                            .replace(/đ/g, "d")
                                                            .replace(/\s+/g, "-")
                                                            .replace(/[^a-z0-9-]/g, "")
                                                            .replace(/-+/g, "-")
                                                            .replace(/^-+|-+$/g, "");
                                                        setForm((prev) => ({...prev, slug: prev.slug ? prev.slug : autoSlug}));
                                                    }}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item label="Slug">
                                                <Input
                                                    name="slug"
                                                    value={form.slug}
                                                    onChange={onChange}
                                                    placeholder="tự động tạo từ tên tour"
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item label="Số ngày">
                                                <Input
                                                    name="num_day"
                                                    type="number"
                                                    min="0"
                                                    value={form.num_day}
                                                    onChange={onChange}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item label="Số đêm">
                                                <Input
                                                    name="num_night"
                                                    type="number"
                                                    min="0"
                                                    value={form.num_night}
                                                    onChange={onChange}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item label="Trạng thái">
                                                <Select
                                                    value={form.status}
                                                    onChange={(val) => setForm(prev => ({...prev, status: val}))}
                                                >
                                                    <Select.Option value="pending">pending</Select.Option>
                                                    <Select.Option value="active">active</Select.Option>
                                                    <Select.Option value="paused">paused</Select.Option>
                                                    <Select.Option value="archived">archived</Select.Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item label="Địa điểm" required>
                                                <Select
                                                    placeholder="Chọn địa điểm"
                                                    value={form.location_id ? String(form.location_id) : undefined}
                                                    onChange={(val) => setForm(prev => ({...prev, location_id: val}))}
                                                >
                                                    {locations.map((l) => (
                                                        <Select.Option key={l.id} value={String(l.id)}>
                                                            {l.name}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={24}>
                                            <Form.Item label="Chủ đề tour" required>
                                                <div className="d-flex flex-wrap gap-3 mt-1">
                                                    {topicOptions.map((topic) => (
                                                        <div className="form-check" key={topic.id}>
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id={`topic-${topic.id}`}
                                                                value={topic.id}
                                                                checked={(form.topics || []).includes(topic.id)}
                                                                onChange={(e) => {
                                                                    const checked = e.target.checked;
                                                                    setForm((prev) => {
                                                                        const topics = new Set(prev.topics || []);
                                                                        if (checked) topics.add(topic.id);
                                                                        else topics.delete(topic.id);
                                                                        return {...prev, topics: Array.from(topics)};
                                                                    });
                                                                }}
                                                            />
                                                            <label className="form-check-label" htmlFor={`topic-${topic.id}`}>
                                                                {topic.name}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                )
                            },
                            {
                                key: "2",
                                label: "Ảnh & Giới thiệu",
                                children: (
                                    <Row gutter={16}>
                                        <Col span={24}>
                                            <Form.Item label="Ảnh đại diện (Thumbnail)">
                                                <div className="d-flex align-items-center gap-3">
                                                    <Upload {...uploadThumbProps}>
                                                        <Button icon={<UploadOutlined />}>Upload Thumbnail</Button>
                                                    </Upload>
                                                    {form.thumbnail_url && (
                                                        <div className="position-relative">
                                                            <img
                                                                src={form.thumbnail_url}
                                                                alt="preview"
                                                                className="img-thumbnail rounded"
                                                                style={{width: 120, height: 80, objectFit: "cover"}}
                                                            />
                                                            <Button
                                                                type="primary"
                                                                danger
                                                                shape="circle"
                                                                size="small"
                                                                icon={<DeleteOutlined />}
                                                                className="position-absolute"
                                                                style={{top: -10, right: -10}}
                                                                onClick={handleRemoveThumbnail}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                <Input
                                                    className="mt-2"
                                                    value={form.thumbnail_url || ""}
                                                    readOnly
                                                    placeholder="URL Cloudinary sẽ hiện ở đây sau khi upload"
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={24}>
                                            <Form.Item label="Ảnh chi tiết (Gallery)">
                                                <div className="mb-2 d-flex flex-wrap gap-2 align-items-center">
                                                    {(form.images_text || "")
                                                        .split("\n")
                                                        .map((u) => u.trim())
                                                        .filter(Boolean)
                                                        .map((u, idx) => (
                                                            <div key={idx} className="position-relative">
                                                                <img
                                                                    src={u}
                                                                    alt={`img-${idx}`}
                                                                    style={{
                                                                        width: 120,
                                                                        height: 80,
                                                                        objectFit: "cover",
                                                                        borderRadius: 8,
                                                                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                                                    }}
                                                                />
                                                                <Button
                                                                    type="primary"
                                                                    danger
                                                                    shape="circle"
                                                                    size="small"
                                                                    icon={<DeleteOutlined />}
                                                                    className="position-absolute"
                                                                    style={{top: -10, right: -10}}
                                                                    onClick={() => handleRemoveGalleryImage(u)}
                                                                />
                                                            </div>
                                                        ))}
                                                    <Upload
                                                        accept="image/*"
                                                        multiple
                                                        showUploadList={false}
                                                        beforeUpload={(file, fileList) => {
                                                            const index = fileList.indexOf(file);
                                                            if (index === fileList.length - 1) {
                                                                uploadDetailImages(fileList);
                                                            }
                                                            return false;
                                                        }}
                                                    >
                                                        <div
                                                            className="d-flex flex-column align-items-center justify-content-center border rounded"
                                                            style={{
                                                                width: 120,
                                                                height: 80,
                                                                cursor: "pointer",
                                                                backgroundColor: "#fafafa",
                                                                borderRadius: "8px",
                                                            }}
                                                        >
                                                            <PlusOutlined style={{fontSize: 18}} />
                                                            <div className="text-muted" style={{fontSize: 11, marginTop: 4}}>Upload</div>
                                                        </div>
                                                    </Upload>
                                                </div>
                                                <Input.TextArea
                                                    rows={3}
                                                    value={form.images_text || ""}
                                                    readOnly
                                                    placeholder="Các URL Cloudinary đã upload sẽ hiện ở đây"
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={24}>
                                            <Form.Item label="Giới thiệu (Overview)">
                                                <Input.TextArea
                                                    name="overview_content"
                                                    rows={6}
                                                    value={form.overview_content}
                                                    onChange={onChange}
                                                    placeholder="Mô tả HTML hoặc text giới thiệu tour..."
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                )
                            },
                            {
                                key: "3",
                                label: "Giá vé theo độ tuổi",
                                children: (
                                    <Row gutter={16}>
                                        {/* Người lớn */}
                                        <Col span={8}>
                                            <Card title="Người lớn (Adult)" size="small">
                                                <Form.Item label="Giá vé">
                                                    <Input
                                                        name="adult_price"
                                                        type="number"
                                                        min="0"
                                                        value={form.adult_price}
                                                        onChange={onChange}
                                                    />
                                                </Form.Item>
                                                <Form.Item label="Giá gốc (Old Price)">
                                                    <Input
                                                        name="adult_old_price"
                                                        type="number"
                                                        min="0"
                                                        value={form.adult_old_price}
                                                        onChange={onChange}
                                                    />
                                                </Form.Item>
                                                <Row gutter={8}>
                                                    <Col span={12}>
                                                        <Form.Item label="Tuổi tối thiểu">
                                                            <Input
                                                                name="adult_min_age"
                                                                type="number"
                                                                min="0"
                                                                value={form.adult_min_age}
                                                                onChange={onChange}
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Form.Item label="Tuổi tối đa">
                                                            <Input
                                                                name="adult_max_age"
                                                                type="number"
                                                                min="0"
                                                                value={form.adult_max_age}
                                                                onChange={onChange}
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                </Row>
                                            </Card>
                                        </Col>
                                        {/* Trẻ em */}
                                        <Col span={8}>
                                            <Card title="Trẻ em (Child)" size="small">
                                                <Form.Item label="Giá vé">
                                                    <Input
                                                        name="child_price"
                                                        type="number"
                                                        min="0"
                                                        value={form.child_price}
                                                        onChange={onChange}
                                                    />
                                                </Form.Item>
                                                <Form.Item label="Giá gốc (Old Price)">
                                                    <Input
                                                        name="child_old_price"
                                                        type="number"
                                                        min="0"
                                                        value={form.child_old_price}
                                                        onChange={onChange}
                                                    />
                                                </Form.Item>
                                                <Row gutter={8}>
                                                    <Col span={12}>
                                                        <Form.Item label="Tuổi tối thiểu">
                                                            <Input
                                                                name="child_min_age"
                                                                type="number"
                                                                min="0"
                                                                value={form.child_min_age}
                                                                onChange={onChange}
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Form.Item label="Tuổi tối đa">
                                                            <Input
                                                                name="child_max_age"
                                                                type="number"
                                                                min="0"
                                                                value={form.child_max_age}
                                                                onChange={onChange}
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                </Row>
                                            </Card>
                                        </Col>
                                        {/* Em bé */}
                                        <Col span={8}>
                                            <Card title="Em bé (Infant)" size="small">
                                                <Form.Item label="Giá vé">
                                                    <Input
                                                        name="infant_price"
                                                        type="number"
                                                        min="0"
                                                        value={form.infant_price}
                                                        onChange={onChange}
                                                    />
                                                </Form.Item>
                                                <Form.Item label="Giá gốc (Old Price)">
                                                    <Input
                                                        name="infant_old_price"
                                                        type="number"
                                                        min="0"
                                                        value={form.infant_old_price}
                                                        onChange={onChange}
                                                    />
                                                </Form.Item>
                                                <Row gutter={8}>
                                                    <Col span={12}>
                                                        <Form.Item label="Tuổi tối thiểu">
                                                            <Input
                                                                name="infant_min_age"
                                                                type="number"
                                                                min="0"
                                                                value={form.infant_min_age}
                                                                onChange={onChange}
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Form.Item label="Tuổi tối đa">
                                                            <Input
                                                                name="infant_max_age"
                                                                type="number"
                                                                min="0"
                                                                value={form.infant_max_age}
                                                                onChange={onChange}
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                </Row>
                                            </Card>
                                        </Col>
                                    </Row>
                                )
                            },
                            {
                                key: "4",
                                label: "Lịch trình & Khởi hành",
                                children: (
                                    <Row gutter={16}>
                                        <Col span={24} className="mb-4">
                                            <Card title={
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span className="fw-semibold">Lịch trình chi tiết</span>
                                                    <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={addSchedule}>Thêm ngày</Button>
                                                </div>
                                            } size="small">
                                                {(form.schedules || []).map((s, idx) => (
                                                    <Card size="small" key={idx} className="mb-2" extra={
                                                        <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => removeSchedule(idx)} />
                                                    }>
                                                        <Row gutter={8} align="middle">
                                                            <Col span={6}>
                                                                <Input
                                                                    value={s.day_text}
                                                                    onChange={(e) => onChangeSchedule(idx, "day_text", e.target.value)}
                                                                    placeholder="Tên ngày (vd: Ngày 1)"
                                                                />
                                                            </Col>
                                                            <Col span={18}>
                                                                <Input.TextArea
                                                                    rows={2}
                                                                    value={s.content}
                                                                    onChange={(e) => onChangeSchedule(idx, "content", e.target.value)}
                                                                    placeholder="Nội dung chi tiết ngày lịch trình..."
                                                                />
                                                            </Col>
                                                        </Row>
                                                    </Card>
                                                ))}
                                            </Card>
                                        </Col>
                                        <Col span={24}>
                                            <Card title={
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span className="fw-semibold">Đợt khởi hành</span>
                                                    <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={addDeparture}>Thêm lịch</Button>
                                                </div>
                                            } size="small">
                                                {(form.departures || []).map((d, idx) => (
                                                    <Card size="small" key={idx} className="mb-2" extra={
                                                        <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => removeDeparture(idx)} />
                                                    }>
                                                        <Row gutter={8}>
                                                            <Col span={6}>
                                                                <Form.Item label="Nơi khởi hành" style={{marginBottom: 0}}>
                                                                    <Input
                                                                        value={d.departure_city}
                                                                        onChange={(e) => onChangeDeparture(idx, "departure_city", e.target.value)}
                                                                        placeholder="Nơi đi (vd: Hà Nội)"
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={5}>
                                                                <Form.Item label="Ngày đi" style={{marginBottom: 0}}>
                                                                    <Input
                                                                        type="date"
                                                                        value={d.departure_date}
                                                                        onChange={(e) => onChangeDeparture(idx, "departure_date", e.target.value)}
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={5}>
                                                                <Form.Item label="Ngày về" style={{marginBottom: 0}}>
                                                                    <Input
                                                                        type="date"
                                                                        value={d.return_date}
                                                                        onChange={(e) => onChangeDeparture(idx, "return_date", e.target.value)}
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={4}>
                                                                <Form.Item label="Số chỗ" style={{marginBottom: 0}}>
                                                                    <Input
                                                                        type="number"
                                                                        min="0"
                                                                        value={d.available_seats}
                                                                        onChange={(e) => onChangeDeparture(idx, "available_seats", e.target.value)}
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={4}>
                                                                <Form.Item label="Giá phụ thu" style={{marginBottom: 0}}>
                                                                    <Input
                                                                        type="number"
                                                                        min="0"
                                                                        value={d.price}
                                                                        onChange={(e) => onChangeDeparture(idx, "price", e.target.value)}
                                                                        placeholder="Mặc định"
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                        </Row>
                                                    </Card>
                                                ))}
                                            </Card>
                                        </Col>
                                    </Row>
                                )
                            },
                            {
                                key: "5",
                                label: "Điều khoản & Lưu ý",
                                children: (
                                    <Row gutter={16}>
                                        <Col span={24}>
                                            <Card title={
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span className="fw-semibold">Thông tin điều khoản</span>
                                                    <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={addTerm}>Thêm mục</Button>
                                                </div>
                                            } size="small">
                                                {(form.terms || []).map((t, idx) => (
                                                    <Card size="small" key={idx} className="mb-2" extra={
                                                        <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => removeTerm(idx)} />
                                                    }>
                                                        <Row gutter={8}>
                                                            <Col span={6}>
                                                                <Input
                                                                    value={t.section_title}
                                                                    onChange={(e) => onChangeTerm(idx, "section_title", e.target.value)}
                                                                    placeholder="Tiêu đề mục (vd: Bao gồm)"
                                                                />
                                                            </Col>
                                                            <Col span={18}>
                                                                <Input.TextArea
                                                                    rows={2}
                                                                    value={t.content}
                                                                    onChange={(e) => onChangeTerm(idx, "content", e.target.value)}
                                                                    placeholder="Chi tiết nội dung điều khoản lưu ý..."
                                                                />
                                                            </Col>
                                                        </Row>
                                                    </Card>
                                                ))}
                                            </Card>
                                        </Col>
                                    </Row>
                                )
                            }
                        ]} />
                    </Form>
                </div>
            </Modal>

            {/* Modal Import */}
            <Modal
                title="Import Tour từ Excel/CSV"
                open={showImport}
                onCancel={() => setShowImport(false)}
                footer={[
                    <Button key="close" onClick={() => setShowImport(false)} disabled={uploading}>
                        Đóng
                    </Button>,
                    <Button key="submit" type="primary" loading={uploading} onClick={handleImport} disabled={!importFile}>
                        Bắt đầu import
                    </Button>
                ]}
            >
                <div className="mb-3">
                    <label className="form-label d-block mb-2">Chọn file (.xlsx, .csv)</label>
                    <Upload
                        accept=".xlsx,.xls,.csv"
                        maxCount={1}
                        beforeUpload={(file) => {
                            setImportFile(file);
                            return false;
                        }}
                        onRemove={() => setImportFile(null)}
                    >
                        <Button icon={<UploadOutlined />}>Chọn file</Button>
                    </Upload>
                    <div className="form-text mt-2 text-muted" style={{fontSize: "12px"}}>
                        Các cột: title, slug, num_day, num_night, price, old_price, location_id, overview, schedule, departure_city,
                        departure_date, return_date, available_seats, term, price_adult, min_age_adult, max_age_adult, price_child,
                        min_age_child, max_age_child, price_infant, min_age_infant, max_age_infant
                    </div>
                </div>
                {uploadMsg && <div className="alert alert-info py-2 mb-0 mt-2">{uploadMsg}</div>}
            </Modal>
        </div>
    );
};

/*
==========================
QUY TRÌNH HOẠT ĐỘNG COMPONENT AdminTours
==========================

1. Khi component mount:
   - Gọi loadLocations để lấy danh sách địa điểm.
   - Gọi loadTours để lấy danh sách tour (theo search/locationId).

2. Người dùng có thể:
   - Tìm kiếm tour, lọc theo địa điểm.
   - Thêm tour mới (openAdd): mở modal, điền form, upload ảnh, submit.
   - Sửa tour (openEdit): tải chi tiết tour, mở modal, chỉnh sửa, submit.
   - Xóa tour (onDelete): xác nhận, gọi API xóa, reload danh sách.

3. Trong modal thêm/sửa tour:
   - Người dùng nhập thông tin cơ bản, upload thumbnail, upload nhiều ảnh chi tiết.
   - Có thể thêm/sửa/xóa lịch trình, ngày khởi hành, thông tin lưu ý.
   - Khi submit, dữ liệu được gom lại thành payload và gửi lên server (API).

4. Upload ảnh:
   - Thumbnail: upload 1 ảnh, lấy URL lưu vào form.
   - Ảnh chi tiết: upload nhiều ảnh, lấy nhiều URL lưu vào form.

5. Import tour từ file Excel/CSV:
   - Mở modal import, chọn file, upload lên server, nhận kết quả thành công/thất bại.

==========================
*/

export default AdminTours;
