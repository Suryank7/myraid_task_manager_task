import { redirect } from 'next/navigation'

export default function TasksRedirect() {
  // Since the main dashboard serves as the comprehensive task view in this iteration, 
  // redirecting /tasks to the root dashboard to prevent duplication and 404s.
  redirect('/')
}
