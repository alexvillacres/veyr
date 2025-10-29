import { ReactQueryDevtools as ReactQueryDevtoolsBase } from '@tanstack/react-query-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { Toaster } from './ui/sonner'
import React from 'react'

const ReactQueryDevtools = import.meta.env.PROD ? () => null : ReactQueryDevtoolsBase

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        <Toaster
          toastOptions={{
            classNames: {
              // !important to override: https://github.com/shadcn-ui/ui/issues/3579
              error: '!border-none !bg-toast-error !text-foreground',
              info: '!border-none !bg-toast-info !text-foreground',
              loading: '!border-none !bg-toast-loading !text-foreground',
              success: '!border-none !bg-toast-success !text-foreground',
              warning: '!border-none !bg-toast-warning !text-foreground'
            }
          }}
        />
        <React.Suspense>
          <ReactQueryDevtools buttonPosition="bottom-right" />
        </React.Suspense>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
