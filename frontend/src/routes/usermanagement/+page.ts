// src/routes/+page.ts
import type { PageLoad } from './$types';
import axios from 'axios';

export const load: PageLoad = async () => {
    try {
        const response = await axios.get("http://localhost:3000/session", {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
        });

        return {
            isActive: response.data.isActive,
            isAdmin: response.data.isAdmin,
            username: response.data.username,
            status: 200
        };
    } catch (error: any) {
        const status = error.response?.status;

        return {
            status
        };
    }
};