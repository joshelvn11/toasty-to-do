import { Navigate, createBrowserRouter } from 'react-router-dom'
import {
  ProtectedRoute,
  PublicOnlyRoute,
} from './components/auth-route-gates.tsx'
import { AppShellPage } from './routes/app-shell-page.tsx'
import { LandingPage } from './routes/landing-page.tsx'
import { SignInPage } from './routes/sign-in-page.tsx'
import { SignUpPage } from './routes/sign-up-page.tsx'

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <PublicOnlyRoute>
        <LandingPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/sign-in',
    element: (
      <PublicOnlyRoute>
        <SignInPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/sign-up',
    element: (
      <PublicOnlyRoute>
        <SignUpPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AppShellPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
