/* eslint-disable react-refresh/only-export-components */

import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'

const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Habits = lazy(() => import('@/pages/Habits'))
const Quests = lazy(() => import('@/pages/Quests'))
const Achievements = lazy(() => import('@/pages/Achievements'))
const Statistics = lazy(() => import('@/pages/Statistics'))
const AICoach = lazy(() => import('@/pages/AICoach'))
const Settings = lazy(() => import('@/pages/Settings'))

const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <p className="text-muted-foreground">Loading...</p>
  </div>
)

export const router = createBrowserRouter([
  {
    path: '/',
    lazy: async () => {
      const { Layout } = await import('@/app/Layout')
      return { Component: Layout }
    },
    children: [
      { index: true, element: <Suspense fallback={<PageLoader />}><Dashboard /></Suspense> },
      { path: 'habits', element: <Suspense fallback={<PageLoader />}><Habits /></Suspense> },
      { path: 'quests', element: <Suspense fallback={<PageLoader />}><Quests /></Suspense> },
      { path: 'achievements', element: <Suspense fallback={<PageLoader />}><Achievements /></Suspense> },
      { path: 'statistics', element: <Suspense fallback={<PageLoader />}><Statistics /></Suspense> },
      { path: 'ai-coach', element: <Suspense fallback={<PageLoader />}><AICoach /></Suspense> },
      { path: 'settings', element: <Suspense fallback={<PageLoader />}><Settings /></Suspense> },
    ],
  },
])