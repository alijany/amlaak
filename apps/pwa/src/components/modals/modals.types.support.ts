export interface SupportRequestData {
    phone: string;
    message?: string;
  }
  
  export interface SupportMessageResponse {
    success: boolean;
    message: string;
    id: string;
  }