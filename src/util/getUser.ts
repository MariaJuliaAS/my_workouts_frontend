import { jwtDecode } from "jwt-decode";


interface TokenPayload {
    name: string;
    username: string;
}

export function getUser() {
    const token = localStorage.getItem("token_my_workouts");

    if (!token) return null;

    const decoded = jwtDecode<TokenPayload>(token);
    return decoded;
}