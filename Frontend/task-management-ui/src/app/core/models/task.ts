// Mirrors TaskResponse DTO from the .NET API
export interface Task {
  id: number;
  title: string;
  description: string | null;
  statusId: number;
  statusName: string;
  userId: number;
  userName: string;
  additionalInfo: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateTaskRequest {
  title: string;
  description: string | null;
  userId: number;
  additionalInfo: string | null;
}

export interface UpdateTaskStatusRequest {
  newStatusId: number;
}

export interface TaskFilters {
  userId: number | null;
  statusId: number | null;
}
