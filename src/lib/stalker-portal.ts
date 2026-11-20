// Stalker Portal API Client
// Handles authentication and communication with Stalker middleware servers

export interface StalkerPortal {
  _row_id?: number;
  _created_by?: string;
  _created_at?: string;
  _updated_at?: string;
  name: string;
  mac_address: string;
  host_url: string;
  portal_url?: string;
  is_active?: number;
  last_used?: string;
  notes?: string;
}

export interface StalkerChannel {
  id: string;
  name: string;
  logo: string;
  stream_url: string;
  number: number;
  group?: string;
  description?: string;
}

export interface StalkerAuthResponse {
  status: string;
  token?: string;
  results?: {
    js?: {
      token?: string;
      locale?: string;
      ad_collector_url?: string;
      ts_checker?: string;
    };
  };
}

export interface StalkerChannelsResponse {
  status: string;
  results?: {
    channels?: Array<{
      id: string;
      name: string;
      logo: string;
      number: number;
      cmd?: string;
      group?: {
        id: string;
        name: string;
      };
    }>;
  };
}

export class StalkerPortalClient {
  private macAddress: string;
  private baseUrl: string;
  private token?: string;

  constructor(macAddress: string, baseUrl: string) {
    this.macAddress = macAddress;
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  // Validate MAC address format
  private static isValidMAC(mac: string): boolean {
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return macRegex.test(mac);
  }

  // Format MAC address consistently
  private static formatMAC(mac: string): string {
    return mac.replace(/[:-]/g, '').toUpperCase().match(/.{2}/g)?.join(':') || mac;
  }

  // Make authenticated request to Stalker API
  private async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (WebOS; Linux; SmartTV) StalkerClient/1.0',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Add token if available
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return fetch(url, { ...options, headers });
  }

  // Authenticate with Stalker Portal using MAC address
  async authenticate(): Promise<StalkerAuthResponse> {
    try {
      const formattedMAC = StalkerPortalClient.formatMAC(this.macAddress);
      
      // Stalker authentication endpoint
      const response = await this.request('/server/load.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          action: 'handshake',
          mac: formattedMAC,
          type: 'stb',
        }),
      });

      const data = await response.json();
      
      if (data.status === 'OK' && data.results?.js?.token) {
        this.token = data.results.js.token;
        return data;
      }
      
      throw new Error('Authentication failed');
    } catch (error) {
      console.error('Stalker authentication error:', error);
      throw error;
    }
  }

  // Get channel list from portal
  async getChannels(): Promise<StalkerChannel[]> {
    try {
      const response = await this.request('/server/load.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          action: 'get_categories',
          type: 'itv',
          js: JSON.stringify({ token: this.token }),
        }),
      });

      const data: StalkerChannelsResponse = await response.json();
      
      if (data.status === 'OK' && data.results?.channels) {
        return data.results.channels.map((ch) => ({
          id: ch.id,
          name: ch.name,
          logo: ch.logo || '',
          number: ch.number,
          stream_url: ch.cmd || '', // Stream URL comes from cmd
          group: ch.group?.name,
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching channels:', error);
      return [];
    }
  }

  // Get stream URL for a channel
  async getStreamUrl(channelId: string): Promise<string> {
    try {
      const response = await this.request('/server/load.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          action: 'create_link',
          type: 'itv',
          cmd: channelId,
          js: JSON.stringify({ token: this.token }),
        }),
      });

      const data = await response.json();
      
      if (data.status === 'OK' && data.results?.cmd) {
        // Handle different stream URL formats
        const streamUrl = data.results.cmd;
        
        // If it's an absolute URL, return as-is
        if (streamUrl.startsWith('http://') || streamUrl.startsWith('https://')) {
          return streamUrl;
        }
        
        // If it's a relative path, prepend base URL
        if (streamUrl.startsWith('/')) {
          return `${this.baseUrl}${streamUrl}`;
        }
        
        // Otherwise assume it's a relative URL
        return `${this.baseUrl}/${streamUrl}`;
      }
      
      throw new Error('Failed to get stream URL');
    } catch (error) {
      console.error('Error getting stream URL:', error);
      throw error;
    }
  }

  // Test portal connection
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const formattedMAC = StalkerPortalClient.formatMAC(this.macAddress);
      
      if (!StalkerPortalClient.isValidMAC(formattedMAC)) {
        return { success: false, message: 'Invalid MAC address format' };
      }
      
      const authResponse = await this.authenticate();
      
      if (authResponse.status === 'OK') {
        return { success: true, message: 'Connection successful!' };
      }
      
      return { success: false, message: 'Authentication failed' };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Connection failed' 
      };
    }
  }
}

// Helper function to format MAC address for display
export function formatMACForDisplay(mac: string): string {
  const formatted = mac.replace(/[:-]/g, '').toUpperCase();
  if (formatted.length !== 12) return mac;
  
  return formatted.match(/.{2}/g)?.join(':') || mac;
}

// Helper function to validate MAC address format
export function isValidMACAddress(mac: string): boolean {
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  return macRegex.test(mac);
}
