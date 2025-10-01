import React, {useEffect, useMemo, useRef, useState} from "react";
import {adminApi} from "../../utils/adminApi";
import axios from "axios";

// Toast Component
const Toast = ({message, type = "success", onClose}) => {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const duration = 3000; // 3 seconds
        const interval = 50; // Update every 50ms
        const decrement = (interval / duration) * 100;

        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev <= 0) {
                    onClose();
                    return 0;
                }
                return prev - decrement;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [onClose]);

    const bgColor = type === "success" ? "#28a745" : type === "error" ? "#dc3545" : "#17a2b8";

    return (
        <div
            className="toast show position-fixed top-0 end-0 m-3 text-white"
            style={{zIndex: 9999, backgroundColor: bgColor, borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)"}}
        >
            <div className="toast-body d-flex justify-content-between align-items-center">
                <span>{message}</span>
                <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
            {/* Progress bar */}
            <div
                className="position-absolute bottom-0 start-0"
                style={{
                    height: "3px",
                    backgroundColor: "rgba(255,255,255,0.3)",
                    width: "100%",
                    borderRadius: "0 0 8px 8px",
                }}
            >
                <div
                    style={{
                        height: "100%",
                        backgroundColor: "rgba(255,255,255,0.6)",
                        width: `${progress}%`,
                        transition: "width 50ms linear",
                        borderRadius: "0 0 8px 8px",
                        marginLeft: "auto",
                    }}
                ></div>
            </div>
        </div>
    );
};

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
    departures: [{departure_city: "", departure_date: "", return_date: "", available_seats: "", price: ""}],
    // Terms
    terms: [{section_title: "Giá bao gồm", content: ""}],
    topics: [],
};

const AdminTours = () => {
    const [tours, setTours] = useState([]);
    const [pagination, setPagination] = useState({totalItems: 0, currentPage: 1, totalPages: 1});
    const [search, setSearch] = useState("");
    const [locationId, setLocationId] = useState("");
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [isEdit, setIsEdit] = useState(false);

    const [showImport, setShowImport] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadMsg, setUploadMsg] = useState("");

    // Toast state
    const [toast, setToast] = useState({show: false, message: "", type: "success"});

    const limit = 10;

    // Refs for hidden file inputs
    const thumbInputRef = useRef(null);
    const galleryInputRef = useRef(null);

    const [topicOptions, setTopicOptions] = useState([]);

    const showToast = (message, type = "success") => {
        setToast({show: true, message, type});
    };

    const hideToast = () => {
        setToast({show: false, message: "", type: "success"});
    };

    // Upload single thumbnail to /api/upload/cloudinary
    /**
     * handleUploadThumbnailFile
     * Luồng hoạt động:
     * - Khi người dùng chọn file thumbnail, hàm này được gọi.
     * - Upload file lên server qua API, lấy URL trả về và lưu vào form.
     * - Nếu lỗi thì hiển thị toast thông báo lỗi.
     * - Reset input file để có thể chọn lại cùng file nếu cần.
     */
    const handleUploadThumbnailFile = async (e) => {
        try {
            // Lấy file đầu tiên từ input
            const file = e.target.files?.[0];
            if (!file) return;
            // Tạo form data để gửi file lên server
            const formData = new FormData();
            formData.append("file", file);
            // Lấy token xác thực từ localStorage
            const token = localStorage.getItem("adminToken");
            // Gọi API upload lên cloudinary
            const {data} = await axios.post("http://localhost:3000/api/upload/cloudinary", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: token ? `Bearer ${token}` : undefined,
                },
            });
            // Nếu upload thành công và có url, lưu vào form
            if (data?.success && data?.url) {
                setForm((prev) => ({...prev, thumbnail_url: data.url}));
            }
        } catch (err) {
            // Nếu lỗi, hiển thị toast thông báo lỗi
            showToast(err.response?.data?.message || "Upload thumbnail thất bại", "error");
        } finally {
            // Reset input file để có thể chọn lại cùng file
            e.target.value = "";
        }
    };

    // Upload multiple images to /api/upload/cloudinary/multiple
    /**
     * handleUploadDetailImages
     * Luồng hoạt động:
     * - Khi người dùng chọn nhiều file ảnh chi tiết, hàm này được gọi.
     * - Upload tất cả file lên server qua API, lấy danh sách URL trả về và lưu vào form.
     * - Nếu lỗi thì hiển thị toast thông báo lỗi.
     * - Reset input file để có thể chọn lại cùng file nếu cần.
     */
    const handleUploadDetailImages = async (e) => {
        try {
            // Lấy danh sách file từ input
            const files = Array.from(e.target.files || []);
            if (files.length === 0) return;
            // Tạo form data để gửi nhiều file lên server
            const formData = new FormData();
            files.forEach((f) => formData.append("files", f));
            // Lấy token xác thực từ localStorage
            const token = localStorage.getItem("adminToken");
            // Gọi API upload nhiều file lên cloudinary
            const {data} = await axios.post("http://localhost:3000/api/upload/cloudinary/multiple", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: token ? `Bearer ${token}` : undefined,
                },
            });
            // Nếu upload thành công và có danh sách file, lấy url và lưu vào form
            if (data?.success && Array.isArray(data?.files)) {
                const urls = data.files.map((f) => f.url).filter(Boolean);
                const appendText = urls.join("\n");
                setForm((prev) => ({
                    ...prev,
                    images_text: prev.images_text ? `${prev.images_text}\n${appendText}` : appendText,
                }));
            }
        } catch (err) {
            // Nếu lỗi, hiển thị toast thông báo lỗi
            showToast(err.response?.data?.message || "Upload ảnh thất bại", "error");
        } finally {
            // Reset input file để có thể chọn lại cùng file
            e.target.value = "";
        }
    };

    // Remove thumbnail URL
    /**
     * handleRemoveThumbnail
     * Luồng hoạt động:
     * - Khi người dùng nhấn nút xóa thumbnail, hàm này được gọi.
     * - Xóa URL thumbnail khỏi form (không xóa trên server).
     */
    const handleRemoveThumbnail = () => {
        // Xóa thumbnail_url trong form
        setForm((prev) => ({...prev, thumbnail_url: ""}));
    };

    // Remove one gallery image URL
    /**
     * handleRemoveGalleryImage
     * Luồng hoạt động:
     * - Khi người dùng nhấn nút xóa ảnh chi tiết, hàm này được gọi.
     * - Xóa URL ảnh khỏi danh sách images_text trong form (không xóa trên server).
     */
    const handleRemoveGalleryImage = (url) => {
        setForm((prev) => {
            // Tách danh sách URL, loại bỏ URL cần xóa, ghép lại thành chuỗi
            const nextList = (prev.images_text || "")
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean)
                .filter((u) => u !== url);
            return {...prev, images_text: nextList.join("\n")};
        });
    };

    const loadLocations = async () => {
        try {
            const {data} = await adminApi.get("/locations");
            setLocations(data);
        } catch (e) {
            console.error(e);
        }
    };

    const loadTours = async (page = 1) => {
        setLoading(true);
        setError("");
        try {
            const params = {page, limit};
            if (search) params.q = search;
            if (locationId) params.locationId = locationId;
            const {data} = await adminApi.get("/tours", {params});
            setTours(data.result || []);
            setPagination(data.pagination || {totalItems: 0, currentPage: 1, totalPages: 1});
        } catch (e) {
            setError(e.response?.data?.message || "Tải danh sách thất bại");
        } finally {
            setLoading(false);
        }
    };

    // Load topics from API
    const loadTopics = async () => {
        try {
            const {data} = await adminApi.get("/topics");
            setTopicOptions(data || []);
        } catch (e) {
            setTopicOptions([]);
        }
    };

    useEffect(() => {
        loadLocations();
    }, []);
    useEffect(() => {
        loadTours(1);
    }, [search, locationId]);

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
            // fetch detail for edit
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
                topics: (data.topics || []).map((topic) => topic.id || topic.slug || topic), // tùy backend trả về
            });
            setShowModal(true);
        } catch (e) {
            showToast("Không tải được chi tiết tour", "error");
        }
    };

    const closeModal = () => {
        // Save form to localStorage when closing (only for add mode, not edit)
        if (!isEdit) {
            localStorage.setItem("adminTourForm", JSON.stringify(form));
        }
        setShowModal(false);
    };

    const onChange = (e) => {
        const {name, value} = e.target;
        setForm((prev) => ({...prev, [name]: value}));
    };

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
        if (!confirm("Xóa lịch ngày này?")) return;
        setForm((prev) => {
            const items = [...(prev.schedules || [])];
            items.splice(index, 1);
            return {...prev, schedules: items};
        });
    };

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
        if (!confirm("Xóa lịch khởi hành này?")) return;
        setForm((prev) => {
            const items = [...(prev.departures || [])];
            items.splice(index, 1);
            return {...prev, departures: items};
        });
    };

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
        if (!confirm("Xóa mục lưu ý này?")) return;
        setForm((prev) => {
            const items = [...(prev.terms || [])];
            items.splice(index, 1);
            return {...prev, terms: items};
        });
    };

    // Hàm build payload riêng
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

    // Validate cơ bản
    const validateForm = (form) => {
        if (!form.title?.trim()) return "Tên tour không được để trống";
        if (!form.location_id) return "Phải chọn địa điểm";
        if (!form.departures || form.departures.length === 0) return "Phải có ít nhất 1 ngày khởi hành";
        if (!form.topics || form.topics.length === 0) return "Phải chọn ít nhất 1 chủ đề tour";
        return null;
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        try {
            // Check validate
            const error = validateForm(form);
            if (error) {
                showToast(error, "error");
                return;
            }

            const payload = buildTourPayload(form);

            if (isEdit) {
                await adminApi.put(`/tours/${form.id}`, payload);
                showToast("Cập nhật tour thành công", "success");
            } else {
                await adminApi.post("/tours", payload);
                showToast("Thêm tour thành công", "success");
                localStorage.removeItem("adminTourForm");
            }

            setShowModal(false);
            loadTours(pagination.currentPage || 1);
        } catch (e) {
            showToast(e.response?.data?.message || "Lưu tour thất bại", "error");
        }
    };

    const onDelete = async (id) => {
        if (!confirm("Xóa tour này?")) return;
        try {
            await adminApi.delete(`/tours/${id}`);
            showToast("Đã xóa tour", "success");
            // reload current page (handle empty page edge-case if needed)
            loadTours(pagination.currentPage || 1);
        } catch (e) {
            showToast(e.response?.data?.message || "Xóa tour thất bại", "error");
        }
    };

    const go = (p) => {
        const page = Math.min(Math.max(1, p), pagination.totalPages || 1);
        loadTours(page);
    };

    // Helper to get old_price value for adult/child
    const getOldPrice = (price, oldPrice) => {
        if (oldPrice !== "" && oldPrice !== null && !isNaN(Number(oldPrice))) {
            return oldPrice;
        }
        if (price !== "" && price !== null && !isNaN(Number(price))) {
            return Math.round(Number(price) * 0.8);
        }
        return "";
    };

    return (
        <div className="container-fluid">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-2 mb-3">
                <h5 className="mb-0">Quản lý Tour</h5>
                <div className="d-flex gap-2">
                    <input className="form-control" placeholder="Tìm tour..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    <select className="form-select" value={locationId} onChange={(e) => setLocationId(e.target.value)} style={{minWidth: 180}}>
                        <option value="">Tất cả địa điểm</option>
                        {locations.map((l) => (
                            <option key={l.id} value={l.id}>
                                {l.name}
                            </option>
                        ))}
                    </select>
                    <button
                        className="btn btn-outline-secondary d-inline-flex align-items-center gap-2 text-nowrap px-3 py-2"
                        onClick={() => loadTours(pagination.currentPage || 1)}
                        disabled={loading}
                        style={{
                            overflow: "visible",
                            position: "relative",
                            zIndex: 2,
                            backgroundColor: "#e3f2fd",
                            borderColor: "#2196f3",
                            color: "#1976d2",
                        }}
                    >
                        <i className="fa-solid fa-rotate-right"></i>
                        <span>Tải lại</span>
                    </button>
                    <button
                        className="btn btn-primary d-inline-flex align-items-center gap-2 text-nowrap py-2"
                        onClick={openAdd}
                        style={{overflow: "visible"}}
                    >
                        <i className="fa-solid fa-plus"></i>
                        <span>Thêm tour mới</span>
                    </button>
                    <button
                        className="btn btn-outline-primary d-inline-flex align-items-center gap-2 px-3 py-2"
                        onClick={() => {
                            setShowImport(true);
                            setImportFile(null);
                            setUploadMsg("");
                            // Reset file input
                            setTimeout(() => {
                                const fileInput = document.querySelector('input[type="file"]');
                                if (fileInput) fileInput.value = "";
                            }, 100);
                        }}
                        style={{minWidth: "150px", backgroundColor: "#f3e5f5", borderColor: "#9c27b0", color: "#7b1fa2"}}
                    >
                        <i className="fa-solid fa-file-arrow-up"></i>
                        <span>Import Tour</span>
                    </button>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card">
                {loading ? (
                    <div className="p-4 text-center text-muted">Đang tải...</div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0 table-bordered table-striped" style={{tableLayout: "fixed"}}>
                            <thead className="table-light">
                                <tr>
                                    <th className="text-center" style={{width: "5%"}}>
                                        #
                                    </th>
                                    <th className="text-center" style={{width: "5%"}}>
                                        ID
                                    </th>
                                    <th className="text-center" style={{width: "30%"}}>
                                        Tên tour
                                    </th>
                                    <th className="text-center" style={{width: "15%"}}>
                                        Giá
                                    </th>
                                    <th className="text-center" style={{width: "12.5%"}}>
                                        Địa điểm
                                    </th>
                                    <th className="text-center" style={{width: "12.5%"}}>
                                        Ngày tạo
                                    </th>
                                    <th className="text-center" style={{width: "10%"}}>
                                        Trạng thái
                                    </th>
                                    <th className="text-center" style={{width: "10%"}}>
                                        Hành động
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {tours.map((t, idx) => (
                                    <tr key={t.id}>
                                        <td className="text-center text-muted">{((pagination.currentPage || 1) - 1) * limit + idx + 1}</td>
                                        <td className="text-center text-muted">{t.id}</td>
                                        <td
                                            className="fw-medium"
                                            style={{wordWrap: "break-word", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "0"}}
                                            title={t.title}
                                        >
                                            {t.title}
                                        </td>
                                        <td className="text-center">{currency(t.price)}</td>
                                        <td className="text-center">{t.location_name || t.location_id}</td>
                                        <td className="text-center">
                                            {t.created_at
                                                ? new Date(t.created_at).toLocaleDateString("vi-VN", {
                                                      day: "2-digit",
                                                      month: "2-digit",
                                                      year: "numeric",
                                                  })
                                                : ""}
                                        </td>
                                        <td className="text-center">
                                            <span
                                                className={`badge ${
                                                    t.status === "active"
                                                        ? "bg-success"
                                                        : t.status === "pending"
                                                        ? "bg-info"
                                                        : t.status === "paused"
                                                        ? "bg-warning text-dark"
                                                        : "bg-secondary"
                                                }`}
                                            >
                                                {t.status || ""}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <div className="d-flex flex-wrap justify-content-center gap-2">
                                                <button className="btn btn-sm btn-outline-secondary" onClick={() => openEdit(t)}>
                                                    <i className="fa-solid fa-pen me-1"></i> Sửa
                                                </button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(t.id)}>
                                                    <i className="fa-solid fa-trash me-1"></i> Xóa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {tours.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="text-center text-muted py-4">
                                            Không có tour phù hợp
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && pagination.totalPages > 1 && (
                    <div className="card-footer d-flex justify-content-between align-items-center">
                        <div className="text-muted small">
                            Trang {pagination.currentPage}/{pagination.totalPages} • Tổng {pagination.totalItems} tour
                        </div>
                        <ul className="pagination mb-0">
                            <li className={`page-item ${pagination.currentPage === 1 ? "disabled" : ""}`}>
                                <button className="page-link" aria-label="Previous" onClick={() => go((pagination.currentPage || 1) - 1)}>
                                    <span aria-hidden="true">&laquo;</span>
                                </button>
                            </li>
                            {(() => {
                                const pages = [];
                                const current = pagination.currentPage || 1;
                                const total = pagination.totalPages || 1;
                                const maxVisible = 5;
                                let start = Math.max(1, current - 2);
                                let end = Math.min(total, start + maxVisible - 1);
                                start = Math.max(1, end - maxVisible + 1);
                                if (start > 1) {
                                    pages.push(
                                        <li key={1} className={`page-item ${current === 1 ? "active" : ""}`}>
                                            <button className="page-link" onClick={() => go(1)}>
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
                                            <button className="page-link" onClick={() => go(p)}>
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
                                            <button className="page-link" onClick={() => go(total)}>
                                                {total}
                                            </button>
                                        </li>
                                    );
                                }
                                return pages;
                            })()}
                            <li className={`page-item ${pagination.currentPage === pagination.totalPages ? "disabled" : ""}`}>
                                <button className="page-link" aria-label="Next" onClick={() => go((pagination.currentPage || 1) + 1)}>
                                    <span aria-hidden="true">&raquo;</span>
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>

            {/* Modal */}
            <div
                className={`modal fade ${showModal ? "show d-block" : ""}`}
                tabIndex="-1"
                role="dialog"
                style={{background: showModal ? "rgba(0,0,0,.5)" : "transparent"}}
            >
                <div className="modal-dialog modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h6 className="modal-title mb-0">{isEdit ? "Sửa tour" : "Thêm tour mới"}</h6>
                            <button type="button" className="btn-close" onClick={closeModal}></button>
                        </div>
                        <form onSubmit={onSubmit}>
                            <div className="modal-body">
                                <div className="row g-3">
                                    {/* Thông tin cơ bản */}
                                    <div className="col-12 col-md-6">
                                        <label className="form-label">Tên tour</label>
                                        <input
                                            name="title"
                                            className="form-control"
                                            value={form.title}
                                            onChange={(e) => {
                                                onChange(e);
                                                const autoSlug = e.target.value
                                                    ?.trim()
                                                    .toLowerCase()
                                                    // Chuyển đổi dấu tiếng Việt
                                                    .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
                                                    .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
                                                    .replace(/ì|í|ị|ỉ|ĩ/g, "i")
                                                    .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
                                                    .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
                                                    .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
                                                    .replace(/đ/g, "d")
                                                    // Thay thế khoảng trắng bằng dấu gạch ngang
                                                    .replace(/\s+/g, "-")
                                                    // Loại bỏ các ký tự đặc biệt không cần thiết, giữ lại chữ cái, số và dấu gạch ngang
                                                    .replace(/[^a-z0-9-]/g, "")
                                                    // Loại bỏ nhiều dấu gạch ngang liên tiếp
                                                    .replace(/-+/g, "-")
                                                    // Loại bỏ dấu gạch ngang ở đầu và cuối
                                                    .replace(/^-+|-+$/g, "");
                                                setForm((prev) => ({...prev, slug: prev.slug ? prev.slug : autoSlug}));
                                            }}
                                            required
                                        />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label">Slug</label>
                                        <input
                                            name="slug"
                                            className="form-control"
                                            value={form.slug}
                                            onChange={onChange}
                                            placeholder="tu-dong-theo-ten"
                                        />
                                    </div>
                                    <div className="col-6 col-md-3">
                                        <label className="form-label">Số ngày</label>
                                        <input
                                            name="num_day"
                                            type="number"
                                            min="0"
                                            className="form-control"
                                            value={form.num_day}
                                            onChange={onChange}
                                        />
                                    </div>
                                    <div className="col-6 col-md-3">
                                        <label className="form-label">Số đêm</label>
                                        <input
                                            name="num_night"
                                            type="number"
                                            min="0"
                                            className="form-control"
                                            value={form.num_night}
                                            onChange={onChange}
                                        />
                                    </div>

                                    <div className="col-12 col-md-6">
                                        <label className="form-label">Trạng thái</label>
                                        <select name="status" className="form-select" value={form.status} onChange={onChange}>
                                            <option value="pending">pending</option>
                                            <option value="active">active</option>
                                            <option value="paused">paused</option>
                                            <option value="archived">archived</option>
                                        </select>
                                    </div>

                                    <div className="col-12 col-md-6">
                                        <label className="form-label">Địa điểm</label>
                                        <select name="location_id" className="form-select" value={form.location_id} onChange={onChange} required>
                                            <option value="">Chọn địa điểm</option>
                                            {locations.map((l) => (
                                                <option key={l.id} value={l.id}>
                                                    {l.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Chủ đề tour */}
                                    <div className="col-12 col-md-6">
                                        <label className="form-label">Chủ đề tour</label>
                                        <div className="d-flex flex-wrap gap-3">
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

                                        {/* Badge hiển thị các chủ đề đã chọn */}
                                        {(form.topics || []).length > 0 && (
                                            <div className="mt-2 d-flex flex-wrap gap-2">
                                                {form.topics.map((tid) => {
                                                    const topic = topicOptions.find((t) => t.id === tid);
                                                    return (
                                                        <span key={tid} className="badge bg-primary">
                                                            {topic ? topic.name : tid}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-12 col-md-6">
                                        <label className="form-label">Thumbnail</label>
                                        <div className="d-flex align-items-center gap-3">
                                            <div
                                                role="button"
                                                onClick={() => thumbInputRef.current?.click()}
                                                className="position-relative d-flex flex-column align-items-center justify-content-center border rounded"
                                                style={{
                                                    width: 180,
                                                    height: 110,
                                                    cursor: "pointer",
                                                    backgroundColor: "#fafafa",
                                                    backgroundImage: form.thumbnail_url ? `url(${form.thumbnail_url})` : "none",
                                                    backgroundSize: "cover",
                                                    backgroundPosition: "center",
                                                    borderRadius: "8px",
                                                    boxShadow: form.thumbnail_url ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                                                    transition: "box-shadow 0.2s",
                                                }}
                                            >
                                                {!form.thumbnail_url && (
                                                    <>
                                                        <div style={{fontSize: 22, lineHeight: 1}}>+</div>
                                                        <div className="text-muted" style={{fontSize: 12}}>
                                                            Upload
                                                        </div>
                                                    </>
                                                )}
                                                {form.thumbnail_url && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-danger position-absolute"
                                                        style={{
                                                            top: 6,
                                                            right: 6,
                                                            width: 24,
                                                            height: 24,
                                                            padding: 0,
                                                            fontSize: 16,
                                                            lineHeight: 1,
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveThumbnail();
                                                        }}
                                                        aria-label="Xóa thumbnail"
                                                        title="Xóa thumbnail"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                            <input
                                                ref={thumbInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="d-none"
                                                onChange={handleUploadThumbnailFile}
                                            />
                                        </div>
                                        <input
                                            className="form-control mt-2"
                                            value={form.thumbnail_url || ""}
                                            readOnly
                                            placeholder="URL Cloudinary sẽ hiện ở đây sau khi upload"
                                        />
                                    </div>

                                    {/* Ảnh chi tiết */}
                                    <div className="col-12">
                                        <label className="form-label">Ảnh chi tiết</label>
                                        <div className="mb-2 d-flex flex-wrap gap-2">
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
                                                                width: 180,
                                                                height: 110,
                                                                objectFit: "cover",
                                                                borderRadius: 8,
                                                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-danger position-absolute d-flex align-items-center justify-content-center"
                                                            style={{
                                                                top: 6,
                                                                right: 6,
                                                                width: 24,
                                                                height: 24,
                                                                padding: 0,
                                                                fontSize: 16,
                                                                lineHeight: 1,
                                                            }}
                                                            onClick={() => handleRemoveGalleryImage(u)}
                                                            aria-label="Xóa ảnh"
                                                            title="Xóa ảnh"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            <div
                                                role="button"
                                                onClick={() => galleryInputRef.current?.click()}
                                                className="d-flex flex-column align-items-center justify-content-center border rounded"
                                                style={{
                                                    width: 180,
                                                    height: 110,
                                                    cursor: "pointer",
                                                    backgroundColor: "#fafafa",
                                                    borderRadius: "8px",
                                                }}
                                            >
                                                <div style={{fontSize: 22, lineHeight: 1}}>+</div>
                                                <div className="text-muted" style={{fontSize: 12}}>
                                                    Upload
                                                </div>
                                            </div>
                                        </div>
                                        <input
                                            ref={galleryInputRef}
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="d-none"
                                            onChange={handleUploadDetailImages}
                                        />
                                        <textarea
                                            className="form-control mb-2"
                                            value={form.images_text || ""}
                                            readOnly
                                            rows="3"
                                            placeholder="Các URL Cloudinary đã upload sẽ hiện ở đây"
                                        />
                                    </div>

                                    {/* Giá theo độ tuổi */}
                                    <div className="col-12">
                                        <div className="border rounded p-3">
                                            <div className="fw-semibold mb-2">Giá theo độ tuổi</div>
                                            <div className="row g-3">
                                                <div className="col-12 col-md-4">
                                                    <label className="form-label">Người lớn (adult) - giá</label>
                                                    <input
                                                        name="adult_price"
                                                        type="number"
                                                        min="0"
                                                        className="form-control"
                                                        value={form.adult_price}
                                                        onChange={onChange}
                                                    />
                                                    <div className="mt-2">
                                                        <input
                                                            name="adult_old_price"
                                                            type="number"
                                                            min="0"
                                                            className="form-control"
                                                            placeholder="Giá gốc (old_price)"
                                                            value={getOldPrice(form.adult_price, form.adult_old_price)}
                                                            onChange={onChange}
                                                        />
                                                    </div>
                                                    <div className="row g-2 mt-2">
                                                        <div className="col-6">
                                                            <input
                                                                name="adult_min_age"
                                                                type="number"
                                                                min="0"
                                                                className="form-control form-control-sm"
                                                                placeholder="Tuổi tối thiểu"
                                                                value={form.adult_min_age}
                                                                onChange={onChange}
                                                            />
                                                        </div>
                                                        <div className="col-6">
                                                            <input
                                                                name="adult_max_age"
                                                                type="number"
                                                                min="0"
                                                                className="form-control form-control-sm"
                                                                placeholder="Tuổi tối đa"
                                                                value={form.adult_max_age}
                                                                onChange={onChange}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-12 col-md-4">
                                                    <label className="form-label">Trẻ em (child) - giá</label>
                                                    <input
                                                        name="child_price"
                                                        type="number"
                                                        min="0"
                                                        className="form-control"
                                                        value={form.child_price}
                                                        onChange={onChange}
                                                    />
                                                    <div className="mt-2">
                                                        <input
                                                            name="child_old_price"
                                                            type="number"
                                                            min="0"
                                                            className="form-control"
                                                            placeholder="Giá gốc (old_price)"
                                                            value={getOldPrice(form.child_price, form.child_old_price)}
                                                            onChange={onChange}
                                                        />
                                                    </div>
                                                    <div className="row g-2 mt-2">
                                                        <div className="col-6">
                                                            <input
                                                                name="child_min_age"
                                                                type="number"
                                                                min="0"
                                                                className="form-control form-control-sm"
                                                                placeholder="Tuổi tối thiểu"
                                                                value={form.child_min_age}
                                                                onChange={onChange}
                                                            />
                                                        </div>
                                                        <div className="col-6">
                                                            <input
                                                                name="child_max_age"
                                                                type="number"
                                                                min="0"
                                                                className="form-control form-control-sm"
                                                                placeholder="Tuổi tối đa"
                                                                value={form.child_max_age}
                                                                onChange={onChange}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-12 col-md-4">
                                                    <label className="form-label">Em bé (infant) - giá</label>
                                                    <input
                                                        name="infant_price"
                                                        type="number"
                                                        min="0"
                                                        className="form-control"
                                                        value={form.infant_price}
                                                        onChange={onChange}
                                                    />
                                                    <div className="mt-2">
                                                        <input
                                                            name="infant_old_price"
                                                            type="number"
                                                            min="0"
                                                            className="form-control"
                                                            placeholder="Giá gốc (old_price)"
                                                            value={form.infant_old_price}
                                                            onChange={onChange}
                                                        />
                                                    </div>
                                                    <div className="row g-2 mt-2">
                                                        <div className="col-6">
                                                            <input
                                                                name="infant_min_age"
                                                                type="number"
                                                                min="0"
                                                                className="form-control form-control-sm"
                                                                placeholder="Tuổi tối thiểu"
                                                                value={form.infant_min_age}
                                                                onChange={onChange}
                                                            />
                                                        </div>
                                                        <div className="col-6">
                                                            <input
                                                                name="infant_max_age"
                                                                type="number"
                                                                min="0"
                                                                className="form-control form-control-sm"
                                                                placeholder="Tuổi tối đa"
                                                                value={form.infant_max_age}
                                                                onChange={onChange}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tổng quan (Overview) */}
                                    <div className="col-12">
                                        <label className="form-label">Tổng quan (Overview)</label>
                                        <textarea
                                            name="overview_content"
                                            rows="4"
                                            className="form-control"
                                            value={form.overview_content}
                                            onChange={onChange}
                                            placeholder="Mô tả HTML hoặc text"
                                        />
                                    </div>
                                    {/* Lịch trình */}
                                    <div className="col-12">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <div className="fw-semibold">Lịch trình</div>
                                            <button type="button" className="btn btn-sm btn-outline-primary" onClick={addSchedule}>
                                                Thêm ngày
                                            </button>
                                        </div>
                                        {(form.schedules || []).map((s, idx) => (
                                            <div key={idx} className="border rounded p-3 mb-2">
                                                <div className="row g-2">
                                                    <div className="col-12 col-md-2">
                                                        <label className="form-label">Thứ tự</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            className="form-control"
                                                            value={s.day_order}
                                                            onChange={(e) => onChangeSchedule(idx, "day_order", e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="col-12 col-md-4">
                                                        <label className="form-label">Ngày</label>
                                                        <input
                                                            className="form-control"
                                                            value={s.day_text}
                                                            onChange={(e) => onChangeSchedule(idx, "day_text", e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="col-12 col-md-5">
                                                        <label className="form-label">Nội dung</label>
                                                        <textarea
                                                            rows="2"
                                                            className="form-control"
                                                            value={s.content}
                                                            onChange={(e) => onChangeSchedule(idx, "content", e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="col-auto d-flex align-items-end">
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger d-inline-flex align-items-center justify-content-center p-1"
                                                            style={{width: 35, height: 35}}
                                                            title="Xóa lịch ngày"
                                                            aria-label="Xóa lịch ngày"
                                                            onClick={() => removeSchedule(idx)}
                                                        >
                                                            <i className="fa-solid fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Ngày khởi hành */}
                                    <div className="col-12">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <div className="fw-semibold">Ngày khởi hành</div>
                                            <button type="button" className="btn btn-sm btn-outline-primary" onClick={addDeparture}>
                                                Thêm lịch
                                            </button>
                                        </div>
                                        {(form.departures || []).map((d, idx) => (
                                            <div key={idx} className="border rounded p-3 mb-2">
                                                <div className="row g-2">
                                                    <div className="col-12 col-md-3">
                                                        <label className="form-label">Nơi khởi hành</label>
                                                        <input
                                                            className="form-control"
                                                            value={d.departure_city}
                                                            onChange={(e) => onChangeDeparture(idx, "departure_city", e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="col-6 col-md-2">
                                                        <label className="form-label">Ngày đi</label>
                                                        <input
                                                            type="date"
                                                            className="form-control"
                                                            value={d.departure_date}
                                                            onChange={(e) => onChangeDeparture(idx, "departure_date", e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="col-6 col-md-2">
                                                        <label className="form-label">Ngày về</label>
                                                        <input
                                                            type="date"
                                                            className="form-control"
                                                            value={d.return_date}
                                                            onChange={(e) => onChangeDeparture(idx, "return_date", e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="col-6 col-md-2">
                                                        <label className="form-label">Số chỗ</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            className="form-control"
                                                            value={d.available_seats}
                                                            onChange={(e) => onChangeDeparture(idx, "available_seats", e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="col-6 col-md-2">
                                                        <label className="form-label">Giá</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            className="form-control"
                                                            value={d.price}
                                                            onChange={(e) => onChangeDeparture(idx, "price", e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="col-auto d-flex align-items-end">
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger d-inline-flex align-items-center justify-content-center p-1"
                                                            style={{width: 35, height: 35}}
                                                            title="Xóa lịch khởi hành"
                                                            aria-label="Xóa lịch khởi hành"
                                                            onClick={() => removeDeparture(idx)}
                                                        >
                                                            <i className="fa-solid fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Thông tin cần lưu ý */}
                                    <div className="col-12">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <div className="fw-semibold">Thông tin cần lưu ý</div>
                                            <button type="button" className="btn btn-sm btn-outline-primary" onClick={addTerm}>
                                                Thêm mục
                                            </button>
                                        </div>
                                        {(form.terms || []).map((t, idx) => (
                                            <div key={idx} className="border rounded p-3 mb-2">
                                                <div className="row g-2">
                                                    <div className="col-12 col-md-4">
                                                        <label className="form-label">Tiêu đề mục</label>
                                                        <input
                                                            className="form-control"
                                                            value={t.section_title}
                                                            onChange={(e) => onChangeTerm(idx, "section_title", e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="col-12 col-md-7">
                                                        <label className="form-label">Nội dung</label>
                                                        <textarea
                                                            rows="2"
                                                            className="form-control"
                                                            value={t.content}
                                                            onChange={(e) => onChangeTerm(idx, "content", e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="col-auto d-flex align-items-end">
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger d-inline-flex align-items-center justify-content-center p-1"
                                                            style={{width: 35, height: 35}}
                                                            title="Xóa mục lưu ý"
                                                            aria-label="Xóa mục lưu ý"
                                                            onClick={() => removeTerm(idx)}
                                                        >
                                                            <i className="fa-solid fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline-secondary" onClick={closeModal}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {isEdit ? "Lưu thay đổi" : "Thêm tour"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Import Modal */}
            <div
                className={`modal fade ${showImport ? "show d-block" : ""}`}
                tabIndex="-1"
                role="dialog"
                style={{background: showImport ? "rgba(0,0,0,.5)" : "transparent"}}
            >
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h6 className="modal-title mb-0">Import Tour từ Excel/CSV</h6>
                            <button type="button" className="btn-close" onClick={() => setShowImport(false)}></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Chọn file (.xlsx, .csv)</label>
                                <input
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    className="form-control"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] || null;
                                        console.log("File selected:", file);
                                        setImportFile(file);
                                    }}
                                />
                                <div className="form-text">
                                    Các cột: title, slug, num_day, num_night, price, old_price, location_id, overview, schedule, departure_city,
                                    departure_date, return_date, available_seats, term, price_adult, min_age_adult, max_age_adult, price_child,
                                    min_age_child, max_age_child, price_infant, min_age_infant, max_age_infant
                                </div>
                            </div>
                            {uploadMsg && <div className="alert alert-info py-2 mb-0">{uploadMsg}</div>}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline-secondary" onClick={() => setShowImport(false)} disabled={uploading}>
                                Đóng
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={async () => {
                                    console.log("Import button clicked, importFile:", importFile);
                                    if (!importFile) {
                                        showToast("Vui lòng chọn file", "error");
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
                                        showToast(`Import thành công: ${data.success} tour, Lỗi: ${data.failed} tour`, "success");
                                        await loadTours(1);
                                    } catch (e) {
                                        setUploadMsg(e.response?.data?.message || "Import thất bại");
                                        showToast(e.response?.data?.message || "Import thất bại", "error");
                                    } finally {
                                        setUploading(false);
                                    }
                                }}
                                disabled={uploading}
                            >
                                {uploading ? "Đang import..." : "Bắt đầu import"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Message */}
            {toast.show && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
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

6. Toast thông báo:
   - Hiển thị thông báo thành công/thất bại cho các thao tác (thêm/sửa/xóa/import/upload).

==========================
*/

export default AdminTours;
