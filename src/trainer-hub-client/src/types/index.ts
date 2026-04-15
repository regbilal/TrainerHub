export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: 'Coach' | 'Client';
  clientId?: string;
}

export interface Client {
  id: string;
  userId?: string;
  coachId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  invitationStatus: 'Pending' | 'Accepted' | 'Expired';
  invitedAt: string;
  joinedAt?: string;
}

export interface TrainingProgram {
  id: string;
  coachId: string;
  name: string;
  description?: string;
  status: 'Active' | 'Archived';
  createdAt: string;
  exercises: Exercise[];
  assignmentCount?: number;
}

export interface Exercise {
  id: string;
  programId: string;
  name: string;
  description?: string;
  sets?: number;
  reps?: number;
  durationSeconds?: number;
  restSeconds?: number;
  order: number;
  notes?: string;
}

export interface ProgramAssignment {
  id: string;
  programId: string;
  clientId: string;
  assignedAt: string;
  status: 'Active' | 'Completed' | 'Paused';
  program?: TrainingProgram;
}

export interface WorkoutLog {
  id: string;
  clientId: string;
  programAssignmentId: string;
  exerciseId: string;
  completedAt: string;
  setsCompleted?: number;
  repsCompleted?: number;
  weightUsed?: number;
  durationSeconds?: number;
  notes?: string;
  exercise?: Exercise;
}

export interface ProgressEntry {
  id: string;
  clientId: string;
  date: string;
  weight?: number;
  bodyFatPercentage?: number;
  notes?: string;
  createdAt: string;
}

export interface CoachSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  averageRating?: number;
  reviewCount: number;
}

export interface Review {
  id: string;
  reviewerUserId: string;
  reviewerName: string;
  revieweeUserId: string;
  revieweeName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MealProgram {
  id: string;
  coachId: string;
  name: string;
  description?: string;
  status: 'Active' | 'Archived';
  createdAt: string;
  days: MealDay[];
  assignmentCount?: number;
}

export interface MealProgramListItem {
  id: string;
  name: string;
  description?: string;
  status: 'Active' | 'Archived';
  createdAt: string;
  dayCount: number;
  assignmentCount: number;
}

export interface MealDay {
  id: string;
  title: string;
  order: number;
  items: MealItem[];
}

export interface MealItem {
  id: string;
  name: string;
  description?: string;
  calories?: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatGrams?: number;
  notes?: string;
  order: number;
}

export interface MealProgramAssignment {
  id: string;
  mealProgramId: string;
  clientId: string;
  assignedAt: string;
  status: 'Active' | 'Completed' | 'Paused';
  mealProgram?: MealProgram;
}

export interface ErrorLog {
  id: string;
  occurredAt: string;
  requestPath?: string;
  httpMethod?: string;
  statusCode?: number;
  exceptionType?: string;
  message?: string;
  stackTrace?: string;
  innerExceptionMessage?: string;
  userId?: string;
  clientIpAddress?: string;
  requestBody?: string;
  queryString?: string;
}

export interface ErrorLogResponse {
  items: ErrorLog[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface ConnectionRequest {
  id: string;
  coachId: string;
  coachName: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  message?: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  createdAt: string;
}
