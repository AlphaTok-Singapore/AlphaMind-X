import '../globals.css'
import type { Metadata } from 'next'
import ClientI18nProvider from '../ClientI18nProvider'
import { TanstackQueryIniter } from '@/context/query-client'
import GlobalPublicStoreProvider from '@/context/global-public-context'

export const metadata: Metadata = {
  title: 'Dify Console - AI Application Platform',
  description: 'Build and operate AI applications with Dify',
}

export default function ConsoleLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <TanstackQueryIniter>
      <GlobalPublicStoreProvider>
        <ClientI18nProvider>
          {children}
        </ClientI18nProvider>
      </GlobalPublicStoreProvider>
    </TanstackQueryIniter>
  )
}
