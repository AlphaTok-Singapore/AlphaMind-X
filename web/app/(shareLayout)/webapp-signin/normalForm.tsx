import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { RiContractLine, RiDoorLockLine, RiErrorWarningFill } from '@remixicon/react'
import Loading from '@/app/components/base/loading'
import MailAndCodeAuth from './components/mail-and-code-auth'
import MailAndPasswordAuth from './components/mail-and-password-auth'
import SSOAuth from './components/sso-auth'
import cn from '@/utils/classnames'
import { LicenseStatus } from '@/types/feature'
import { IS_CE_EDITION } from '@/config'
import { useGlobalPublicStore } from '@/context/global-public-context'

const NormalForm = () => {
  const { t } = useTranslation()

  const [isLoading, setIsLoading] = useState(true)
  const { systemFeatures } = useGlobalPublicStore()
  const [authType, setAuthType] = useState<'code' | 'password'>('password')
  const [showORLine, setShowORLine] = useState(false)
  const [allMethodsAreDisabled, setAllMethodsAreDisabled] = useState(false)

  const init = useCallback(async () => {
    if (!systemFeatures)
      return
    try {
      console.log('[webapp-signin/normalForm] systemFeatures:', systemFeatures)
      setAllMethodsAreDisabled(!systemFeatures.enable_social_oauth_login && !systemFeatures.enable_email_code_login && !systemFeatures.enable_email_password_login && !systemFeatures.sso_enforced_for_signin)
      setShowORLine((systemFeatures.enable_social_oauth_login || systemFeatures.sso_enforced_for_signin) && (systemFeatures.enable_email_code_login || systemFeatures.enable_email_password_login))
      setAuthType(systemFeatures.enable_email_password_login ? 'password' : 'code')
    }
    catch (error) {
      console.error(error)
      setAllMethodsAreDisabled(true)
    }
    finally { setIsLoading(false) }
  }, [systemFeatures])
  useEffect(() => {
    init()
  }, [init, systemFeatures])
  if (isLoading) {
    return <div className={
      cn(
        'flex w-full grow flex-col items-center justify-center',
        'px-6',
        'md:px-[108px]',
      )
    }>
      <Loading type='area' />
    </div>
  }
  if (systemFeatures.license?.status === LicenseStatus.LOST) {
    return <div className='mx-auto mt-8 w-full'>
      <div className='relative'>
        <div className="rounded-lg bg-gradient-to-r from-workflow-workflow-progress-bg-1 to-workflow-workflow-progress-bg-2 p-4">
          <div className='shadows-shadow-lg relative mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-components-card-bg shadow'>
            <RiContractLine className='h-5 w-5' />
            <RiErrorWarningFill className='absolute -right-1 -top-1 h-4 w-4 text-text-warning-secondary' />
          </div>
          <p className='system-sm-medium text-text-primary'>{t('login.licenseLost')}</p>
          <p className='system-xs-regular mt-1 text-text-tertiary'>{t('login.licenseLostTip')}</p>
        </div>
      </div>
    </div>
  }
  if (systemFeatures.license?.status === LicenseStatus.EXPIRED) {
    return <div className='mx-auto mt-8 w-full'>
      <div className='relative'>
        <div className="rounded-lg bg-gradient-to-r from-workflow-workflow-progress-bg-1 to-workflow-workflow-progress-bg-2 p-4">
          <div className='shadows-shadow-lg relative mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-components-card-bg shadow'>
            <RiContractLine className='h-5 w-5' />
            <RiErrorWarningFill className='absolute -right-1 -top-1 h-4 w-4 text-text-warning-secondary' />
          </div>
          <p className='system-sm-medium text-text-primary'>{t('login.licenseExpired')}</p>
          <p className='system-xs-regular mt-1 text-text-tertiary'>{t('login.licenseExpiredTip')}</p>
        </div>
      </div>
    </div>
  }
  if (systemFeatures.license?.status === LicenseStatus.INACTIVE) {
    return <div className='mx-auto mt-8 w-full'>
      <div className='relative'>
        <div className="rounded-lg bg-gradient-to-r from-workflow-workflow-progress-bg-1 to-workflow-workflow-progress-bg-2 p-4">
          <div className='shadows-shadow-lg relative mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-components-card-bg shadow'>
            <RiContractLine className='h-5 w-5' />
            <RiErrorWarningFill className='absolute -right-1 -top-1 h-4 w-4 text-text-warning-secondary' />
          </div>
          <p className='system-sm-medium text-text-primary'>{t('login.licenseInactive')}</p>
          <p className='system-xs-regular mt-1 text-text-tertiary'>{t('login.licenseInactiveTip')}</p>
        </div>
      </div>
    </div>
  }

  const shouldShowAllMethodsDisabled = (() => {
    console.log('[webapp-signin/normalForm] allMethodsAreDisabled:', allMethodsAreDisabled, 'authType:', authType, 'showORLine:', showORLine)
    return allMethodsAreDisabled
  })()

  return (
    <div className="mx-auto mt-8 w-full">
      <div className="mx-auto w-full">
        <h2 className="title-4xl-semi-bold text-text-primary">{t('login.pageTitle')}</h2>
        {!systemFeatures.branding.enabled && <p className='body-md-regular mt-2 text-text-tertiary'>{t('login.welcome')}</p>}
      </div>
      <div className="relative">
        <div className="mt-6 flex flex-col gap-3">
          {systemFeatures.sso_enforced_for_signin && <div className='w-full'>
            <SSOAuth protocol={systemFeatures.sso_enforced_for_signin_protocol} />
          </div>}
        </div>

        {showORLine && <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className='h-px w-full bg-gradient-to-r from-background-gradient-mask-transparent via-divider-regular to-background-gradient-mask-transparent'></div>
          </div>
          <div className="relative flex justify-center">
            <span className="system-xs-medium-uppercase px-2 text-text-tertiary">{t('login.or')}</span>
          </div>
        </div>}
        {
          (systemFeatures.enable_email_code_login || systemFeatures.enable_email_password_login) && (
            <React.Fragment>
              {systemFeatures.enable_email_code_login && authType === 'code' && (
                <React.Fragment>
                  <MailAndCodeAuth />
                  {systemFeatures.enable_email_password_login && <button type="button" className='w-full cursor-pointer border-none bg-transparent py-1 text-center' onClick={() => { setAuthType('password') }}>
                    <span className='system-xs-medium text-components-button-secondary-accent-text'>{t('login.usePassword')}</span>
                  </button>}
                </React.Fragment>
              )}
              {systemFeatures.enable_email_password_login && authType === 'password' && (
                <React.Fragment>
                  <MailAndPasswordAuth isEmailSetup={systemFeatures.is_email_setup} />
                  {systemFeatures.enable_email_code_login && <button type="button" className='w-full cursor-pointer border-none bg-transparent py-1 text-center' onClick={() => { setAuthType('code') }}>
                    <span className='system-xs-medium text-components-button-secondary-accent-text'>{t('login.useVerificationCode')}</span>
                  </button>}
                </React.Fragment>
              )}
            </React.Fragment>
          )
        }
        {shouldShowAllMethodsDisabled && (
          <React.Fragment>
            <div className="rounded-lg bg-gradient-to-r from-workflow-workflow-progress-bg-1 to-workflow-workflow-progress-bg-2 p-4">
              <div className='shadows-shadow-lg mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-components-card-bg shadow'>
                <RiDoorLockLine className='h-5 w-5' />
              </div>
              <p className='system-sm-medium text-text-primary'>{t('login.noLoginMethod')}</p>
              <p className='system-xs-regular mt-1 text-text-tertiary'>{t('login.noLoginMethodTip')}</p>
            </div>
            <div className="relative my-2 py-2">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className='h-px w-full bg-gradient-to-r from-background-gradient-mask-transparent via-divider-regular to-background-gradient-mask-transparent'></div>
              </div>
            </div>
          </React.Fragment>
        )}
        {!systemFeatures.branding.enabled && (
          <React.Fragment>
            <div className="system-xs-regular mt-2 block w-full text-text-tertiary">
              {t('login.tosDesc')}
              &nbsp;
              <Link
                className='system-xs-medium text-text-secondary hover:underline'
                target='_blank' rel='noopener noreferrer'
                href='https://dify.ai/terms'
              >{t('login.tos')}</Link>
              &nbsp;&&nbsp;
              <Link
                className='system-xs-medium text-text-secondary hover:underline'
                target='_blank' rel='noopener noreferrer'
                href='https://dify.ai/privacy'
              >{t('login.pp')}</Link>
            </div>
            {IS_CE_EDITION && <div className="system-xs-regular mt-2 block w-full text-text-tertiary">
              {t('login.goToInit')}
              &nbsp;
              <Link
                className='system-xs-medium text-text-secondary hover:underline'
                href='/install'
              >{t('login.setAdminAccount')}</Link>
            </div>}
          </React.Fragment>
        )}
      </div>
    </div>
  )
}

export default NormalForm
