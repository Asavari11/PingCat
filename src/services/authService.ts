
const API_BASE_URL = "http://localhost:4000/api"; 
const TOKEN_KEY = 'authToken';

export interface AuthResponse {
    token: string;
    userId: string;
    username: string;
}

export interface UserSession {
    userId: string;
    username: string;
}

export interface Profile {
    id: string;
    name: string;
    
}


export const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

export const saveToken = (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
    localStorage.removeItem(TOKEN_KEY);
};


const getAuthHeaders = (token: string) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
});


export const validateToken = async (): Promise<UserSession | null> => {
    const token = getToken();
    if (!token) return null;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/token`, {
            method: 'POST',
            headers: getAuthHeaders(token),
        });

        if (!response.ok) {
            removeToken();
            return null;
        }

        const data: UserSession = await response.json(); 
        return data;

    } catch (error) {
        removeToken();
        return null;
    }
};

export const loginUser = async (usernameOrEmail: string, password: string, rememberMe: boolean): Promise<AuthResponse> => {
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (password === 'fail') {
        throw new Error("Incorrect password or email.");
    }
    
    return { 
        token: `mock-jwt-token-${Date.now()}`, 
        userId: usernameOrEmail === 'test' ? 'user-abc-123' : `user-${Math.random()}`, 
        username: 'TestUser' 
    };
};

export const registerUser = async (username: string, email: string, password: string): Promise<AuthResponse> => {
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return { 
        token: `mock-reg-token-${Date.now()}`, 
        userId: `user-new-${Math.random()}`, 
        username: username 
    };
};


export const getProfiles = async (): Promise<Profile[]> => {
    const token = getToken();
    if (!token) throw new Error("Authentication required to fetch profiles.");
    

    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockProfiles: Profile[] = [
        { id: 'p-1', name: 'Work Profile' },
        { id: 'p-2', name: 'Personal Tasks' },
    ];
    
    return mockProfiles;
};

export const createProfile = async (profileName: string): Promise<Profile> => {
    const token = getToken();
    if (!token) throw new Error("Authentication required to create a profile.");


    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const newProfile: Profile = {
        id: `p-${Date.now()}`,
        name: profileName,
    };
    
    return newProfile;
};
