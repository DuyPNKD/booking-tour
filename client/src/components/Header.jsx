// src/components/Header.jsx
import {Link} from "react-router-dom";

function Header() {
    return (
        <header>
            <nav>
                <Link to="/">Trang chủ</Link>
                {/* Sau này thêm menu Tour, Tin tức, Liên hệ... */}
            </nav>
        </header>
    );
}

export default Header;
