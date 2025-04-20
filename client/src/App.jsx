// src/App.jsx
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import Home from "./pages/home/Home";
import Tours from "./pages/tours/Tours";
import TourDetail from "./pages/tourdetail/TourDetail";
// import Login from "./pages/login/Login";
// import Register from "./pages/register/Register";
import Footer from "./components/footer/Footer";
import "./App.css";

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/tours" element={<Tours />} />
                <Route path="/tours/:id" element={<TourDetail />} />
                {/* <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} /> */}
            </Routes>
            <Footer />
        </Router>
    );
}

export default App;
