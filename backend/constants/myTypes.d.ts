export interface User {
  id: number
  first_name: string
  last_name: string
  workspaces: Array<{ role: string, workspace_id: number }>
  feedback_logs: Array<number>
  to_do_categories: Array<string>
}

