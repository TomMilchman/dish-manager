import { jwtDecode } from "jwt-decode";
import useAuthStore from "../store/useAuthStore";

/**
 * Extracts the username and role from the stored JWT access token.
 *
 * This function decodes the JWT access token saved in the Zustand auth store,
 * returning the username and role fields from the token payload.
 *
 * Note:
 * - This only decodes the token; it does NOT verify its validity or signature.
 * - Make sure the access token exists and is valid before calling this function to avoid errors.
 *
 * @returns {{ username: string, role: string }} An object containing the username and role of the user.
 * @throws Will throw an error if there is no access token or if decoding fails.
 */
export function getUserCredentialsFromAccessToken() {
    try {
        const accessToken = useAuthStore.getState().accessToken;
        const decoded = jwtDecode(accessToken);
        return { username: decoded.username, role: decoded.role };
    } catch (err) {
        console.log(err);
        throw err;
    }
}
