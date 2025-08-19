import {createContext, useContext, useState, useEffect} from "react";

// Tạo Context
const AuthContext = createContext();

// Provider
export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    // Khi app load, kiểm tra localStorage xem có token không
    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
    }, []);

    // Hàm login → lưu token & user vào state + localStorage
    const login = (token, user) => {
        setToken(token);
        setUser(user);
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
    };

    // Hàm logout → clear hết
    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    return <AuthContext.Provider value={{user, token, login, logout}}>{children}</AuthContext.Provider>;
};

// Custom hook cho gọn
export const useAuth = () => useContext(AuthContext);
