/**
 * Mirrors TaskStatusResponse DTO from GET /api/statuses.
 * Statuses are ordered by sortOrder; the UI advances tasks through them sequentially.
 */
export interface TaskStatus {
  id: number;
  /** Display label shown in the filter dropdown and status badge (e.g. 'Pending'). */
  name: string;
  description?: string;
  /** Controls the order in which statuses appear in the filter dropdown. */
  sortOrder: number;
}
