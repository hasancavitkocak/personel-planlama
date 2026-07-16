export interface User {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface Personnel {
  id: string;
  name: string;
  role: string;
  skills: string[];
  capacity: number;
  avatar: string;
  color: string;
  workCenter?: string;
}

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'unassigned' | 'assigned' | 'in-progress' | 'completed';
  duration: number;
  requiredSkill: string;
  location: string;
  plannedDate: string | null;
  assignedTo: string | null;
  startHour: number | null;
  equipment: string;
  orderType: string;
  workCenter?: string;
}

export interface Assignment {
  id: string;
  workOrderId: string;
  personnelId: string;
  date: string;
  startHour: number;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed';
  title: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  equipment: string;
}

export interface PlanningCalendar {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  workOrderIds: string[];
}

export interface LeaveRecord {
  id: string;
  personnelId: string;
  startDate: string;
  endDate: string;
}

