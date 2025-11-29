import { createContext, useState, useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);

    // Function to refresh the token
    const refreshAccessToken = async (refresh_token) => {
        try {
            const response = await axios.get(`${API}/spotify/refresh_token`, {
                params: { refresh_token: refresh_token },
            });
            const { access_token } = response.data;
            setUserData((prevData) => ({
                ...prevData,
                access_token,
            }));
            localStorage.setItem("access_token", access_token);
        } catch (error) {
            console.error("Error refreshing access token", error);
        }
    };

    const login = ({ access_token, refresh_token, id }) => {
        setUserData({ access_token, refresh_token, id });
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);
        localStorage.setItem("id", id);
        localStorage.setItem("isLoggedIn", true);

        const interval = setInterval(() => {
            refreshAccessToken(refresh_token);
        }, 3600000);

        localStorage.setItem("refreshInterval", interval);
    };

    const logout = async ({ id }) => {
        setUserData(null);
        localStorage.clear();
        console.log(id);
        clearInterval(localStorage.getItem("refreshInterval"));
        localStorage.removeItem("refreshInterval");
        localStorage.setItem("isLoggedIn", false);
    };

    useEffect(() => {
        const isLoggedIn = localStorage.getItem("isLoggedIn");
        if (isLoggedIn) {
            const access_token = localStorage.getItem("access_token");
            const refresh_token = localStorage.getItem("refresh_token");
            const id = localStorage.getItem("id");
            setUserData({ access_token, refresh_token, id });

            const interval = setInterval(() => {
                refreshAccessToken(refresh_token);
            }, 3600000);

            localStorage.setItem("refreshInterval", interval);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ userData, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };
