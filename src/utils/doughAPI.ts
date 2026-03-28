import axios, { AxiosInstance } from 'axios';

/**
 * API Client for Doughmination Website
 * Handles authentication and requests to the backend API
 */
class DoughAPIClient {
    private client: AxiosInstance;
    private token: string;
    private baseURL: string;

    constructor() {
        this.token = process.env.DOUGH_API_TOKEN || '';
        this.baseURL = 'https://system.kib.lol';

        if (!this.token) {
            console.error('WARNING: DOUGH_API_TOKEN not set in .env file!');
        }

        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'User-Agent': 'CloveShortcuts/1.0.0',
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 second timeout
        });
    }

    /**
     * Test the connection to the API
     */
    async healthCheck(): Promise<{ status: string; authenticated: boolean }> {
        try {
            const response = await this.client.get('/api/bot/health');
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Health check failed: ${error.response?.data?.detail || error.message}`);
            }
            throw error;
        }
    }

    /**
     * Get system information
     */
    async getSystemInfo(): Promise<any> {
        try {
            const response = await this.client.get('/api/bot/system/info');
            return response.data.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Failed to get system info: ${error.response?.data?.detail || error.message}`);
            }
            throw error;
        }
    }

    /**
     * Get all members
     */
    async getMembers(): Promise<any[]> {
        try {
            const response = await this.client.get('/api/bot/members');
            return response.data.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Failed to get members: ${error.response?.data?.detail || error.message}`);
            }
            throw error;
        }
    }

    /**
     * Get current fronters
     */
    async getFronters(): Promise<any> {
        try {
            const response = await this.client.get('/api/bot/fronters');
            return response.data.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Failed to get fronters: ${error.response?.data?.detail || error.message}`);
            }
            throw error;
        }
    }

    /**
     * Switch to multiple fronters at once (recommended method)
     * This matches the behavior of the SwitchManager panel
     */
    async multiSwitch(memberIds: string[]): Promise<{ status: string; message: string; fronters: any[]; count: number }> {
        try {
            const response = await this.client.post('/api/bot/switch', {
                member_ids: memberIds
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Failed to switch fronters: ${error.response?.data?.detail || error.message}`);
            }
            throw error;
        }
    }

    /**
     * DEPRECATED: Add a member to the front
     * Use multiSwitch instead for better consistency
     * @deprecated Use multiSwitch() instead
     */
    async addFronter(memberId: string): Promise<{ success: boolean; message: string; fronters: any[] }> {
        console.warn('addFronter() is deprecated. Use multiSwitch() instead.');
        try {
            const response = await this.client.post('/api/bot/fronters/add', {
                member_id: memberId
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Failed to add fronter: ${error.response?.data?.detail || error.message}`);
            }
            throw error;
        }
    }

    /**
     * DEPRECATED: Remove a member from the front
     * Use multiSwitch instead for better consistency
     * @deprecated Use multiSwitch() instead
     */
    async removeFronter(memberId: string): Promise<{ success: boolean; message: string; fronters: any[] }> {
        console.warn('removeFronter() is deprecated. Use multiSwitch() instead.');
        try {
            const response = await this.client.post('/api/bot/fronters/remove', {
                member_id: memberId
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Failed to remove fronter: ${error.response?.data?.detail || error.message}`);
            }
            throw error;
        }
    }

    /**
     * Regenerate the bot access token (self-regeneration)
     */
    async regenerateToken(): Promise<{ success: boolean; message: string; new_token: string }> {
        try {
            const response = await this.client.post('/api/bot/token/regenerate-self');
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Failed to regenerate token: ${error.response?.data?.detail || error.message}`);
            }
            throw error;
        }
    }
}

// Export singleton instance
export const doughAPI = new DoughAPIClient();
