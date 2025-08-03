const backendURL = 'https://student-helper-backend.vercel.app';
// const backendURL = 'http://localhost:3080'

export async function fetchBackend(endpoint, {
    method = 'GET',
    body = null,
    headers = {},
    fallback = null
} = {}) {
    try {
        const response = await fetch(`${backendURL}/${endpoint}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Bypass-Tunnel-Reminder': 'true',
                ...headers
            },
            body: body ? JSON.stringify(body) : null
        });

        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson ? await response.json() : null;

        if (!response.ok) {
            const errorMessage = data?.error || `Request failed: ${endpoint}`;
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error(error);
        return fallback;
    }
}

export const putBackend = (endpoint, body) =>
    fetchBackend(endpoint, { method: 'PUT', body });

export const postBackend = (endpoint, body) =>
    fetchBackend(endpoint, { method: 'POST', body });

export const patchBackend = (endpoint, body) =>
    fetchBackend(endpoint, { method: 'PATCH', body });

export const deleteBackend = (endpoint) =>
    fetchBackend(endpoint, { method: 'DELETE' });
