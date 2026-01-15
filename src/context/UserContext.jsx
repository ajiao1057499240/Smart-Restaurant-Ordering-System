// src/context/UserContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);

    // 保存登录状态
    const saveLogin = (userData, jwtToken) => {
        setUser(userData);
        setToken(jwtToken);
        localStorage.setItem("token", jwtToken);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    // 登出
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    // 初始化读取 localStorage
    useEffect(() => {
        const cachedUser = localStorage.getItem("user");
        if (cachedUser) setUser(JSON.parse(cachedUser));
    }, []);

    return (
        <UserContext.Provider value={{ user, token, saveLogin, logout }}>
            {children}
        </UserContext.Provider>
    );
};
