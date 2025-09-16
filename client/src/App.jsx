import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Home from "./pages/home/Home";
import Tours from "./pages/tours/Tours";
import TourDetail from "./pages/tourdetail/TourDetail";
import About from "./pages/about/About";
import Contact from "./pages/contact/Contact";
import AuthPage from "./pages/auth/AuthPage";
import Blog from "./pages/blog/Blog";
import BookingPage from "./pages/booking/BookingPage";
import PaymentPage from "./pages/payment/PaymentPage";
import PaymentResult from "./pages/paymentResult/PaymentResultPage";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import ProfilePage from "./pages/dashboard/ProfilePage";
import TripsPage from "./pages/dashboard/TripsPage";
import VoucherPage from "./pages/dashboard/VoucherPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";

import "./App.css";

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                {/* Trang chủ */}
                <Route path="/" element={<Home />} />

                {/* Danh mục tour */}
                <Route path="/danh-muc-tour" element={<Tours />} />

                {/* Chi tiết tour */}
                <Route path="/tours/:id" element={<TourDetail />} />

                {/* Cẩm nang du lịch */}
                <Route path="/blog" element={<Blog />} />

                {/* Trang giới thiệu */}
                <Route path="/about" element={<About />} />

                {/* Trang liên hệ */}
                <Route path="/contact" element={<Contact />} />

                {/* Trang đăng nhập */}
                <Route path="/auth/login" element={<AuthPage />} />

                {/* Trang đăng nhập admin */}
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* Trang đặt tour */}
                <Route path="/booking/:id" element={<BookingPage />} />

                {/* Trang thanh toán */}
                <Route path="/payment/:id" element={<PaymentPage />} />

                {/* Trang kết quả thanh toán */}
                <Route path="/payment-result" element={<PaymentResult />} />

                {/* Dashboard */}
                <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="trips" element={<TripsPage />} />
                    <Route path="voucher" element={<VoucherPage />} />
                </Route>

                {/* Trang 404 */}
                <Route path="*" element={<div>404 - Không tìm thấy trang</div>} />
            </Routes>
            <Footer />
        </Router>
    );
}

export default App;
