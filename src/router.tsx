import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppShellPage } from './routes/app-shell-page.tsx'
import { LandingPage } from './routes/landing-page.tsx'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/app',
    element: <AppShellPage />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
