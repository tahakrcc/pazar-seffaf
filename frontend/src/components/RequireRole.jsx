import { Navigate } from 'react-router-dom'

/**
 * Yalnızca allow listesindeki roller için children render eder.
 */
export default function RequireRole({ user, allow, children, fallbackTo = '/' }) {
  const role = user?.role
  if (!role || !allow.includes(role)) {
    return <Navigate to={fallbackTo} replace />
  }
  return children
}
