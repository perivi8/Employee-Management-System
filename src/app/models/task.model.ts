export interface Task {
  _id?: string;
  title: string;
  description: string;
  assigned_to: string;
  priority: string;
  status: string;
  deadline: string;
  created_by?: string;
  created_at?: string;
}
