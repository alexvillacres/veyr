import '../assets/global.css'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Providers } from '@renderer/components/providers'

export const Route = createRootRoute({
  component: () => (
    <Providers>
      <Outlet />
    </Providers>
  )
})
