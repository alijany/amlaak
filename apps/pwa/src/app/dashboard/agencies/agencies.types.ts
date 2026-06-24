export interface PendingAgency {
  id: number;
  name: string;
  phone?: string;
  isActive: boolean;
  isConfirmed: boolean;
  owner?: {
    id: number;
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
  created_at?: string;
}
