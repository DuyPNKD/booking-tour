import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Home from "./pages/home/Home";
import Tours from "./pages/tours/Tours";
import TourDetail from "./pages/tourdetail/TourDetail";
import About from "./pages/about/About";
import Contact from "./pages/contact/Contact";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Blog from "./pages/blog/Blog";
import BookingPage from "./pages/booking/BookingPage";
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
                <Route path="/login" element={<Login />} />

                {/* Trang đăng ký */}
                <Route path="/register" element={<Register />} />

                {/* Trang đặt tour */}
                <Route path="/booking/:id" element={<BookingPage />} />

                {/* Trang 404 */}
                <Route path="*" element={<div>404 - Không tìm thấy trang</div>} />
            </Routes>
            <Footer />
        </Router>
    );
}

export default App;
