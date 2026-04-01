// User Types
export interface IUser {
  id: string;
  email: string;
  password: string;
  role: 'VIEWER' | 'ANALYST' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserWithoutPassword extends Omit<IUser, 'password'> {}

export type UserRole = 'VIEWER' | 'ANALYST' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

// Record Types
export interface IRecord {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  date: Date;
  notes: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type RecordType = 'INCOME' | 'EXPENSE';

// Auth Types
export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthPayload {
  id: string;
  role: UserRole;
}

export interface ILoginResponse {
  _id: string;
  email: string;
  role: UserRole;
  accessToken: string;
  refreshToken: string;
}

export interface IRegisterPayload {
  email: string;
  password: string;
}

export interface ILoginPayload {
  email: string;
  password: string;
}

// Dashboard Types
export interface IDashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  categoryTotals: Record<string, number>;
  recentActivity: Array<{
    id: string;
    amount: number;
    type: RecordType;
    category: string;
    date: Date;
  }>;
}

// Request Filter Types
export interface IRecordFilters {
  type?: RecordType;
  category?: string;
  startDate?: Date;
  endDate?: Date;
}
