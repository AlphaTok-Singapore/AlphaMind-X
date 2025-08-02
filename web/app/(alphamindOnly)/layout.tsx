'use client'

import React from 'react'
import type { ReactNode } from 'react'
import SwrInitor from '@/app/components/swr-initor'
import { AppContextProvider } from '@/context/app-context'
import { EventEmitterContextProvider } from '@/context/event-emitter'
import { ProviderContextProvider } from '@/context/provider-context'
import { ModalContextProvider } from '@/context/modal-context'
import { AlphaMindProvider } from '@/context/alphamind/AlphaMindContext'

const AlphaMindLayout = ({ children }: { children: ReactNode }) => {
  return (
    <SwrInitor>
      <AppContextProvider>
        <EventEmitterContextProvider>
          <ProviderContextProvider>
            <ModalContextProvider>
              <AlphaMindProvider>
                {children}
              </AlphaMindProvider>
            </ModalContextProvider>
          </ProviderContextProvider>
        </EventEmitterContextProvider>
      </AppContextProvider>
    </SwrInitor>
  )
}

export default AlphaMindLayout
