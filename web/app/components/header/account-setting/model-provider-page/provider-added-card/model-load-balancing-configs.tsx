import type { Dispatch, SetStateAction } from 'react'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  RiDeleteBinLine,
} from '@remixicon/react'
import type { ConfigurationMethodEnum, CustomConfigurationModelFixedFields, ModelLoadBalancingConfig, ModelLoadBalancingConfigEntry, ModelProvider } from '../declarations'
import Indicator from '../../../indicator'
import CooldownTimer from './cooldown-timer'
import classNames from '@/utils/classnames'
import Tooltip from '@/app/components/base/tooltip'
import Switch from '@/app/components/base/switch'
import { Balance } from '@/app/components/base/icons/src/vender/line/financeAndECommerce'
import { Edit02, Plus02 } from '@/app/components/base/icons/src/vender/line/general'
import { AlertTriangle } from '@/app/components/base/icons/src/vender/solid/alertsAndFeedback'
import { useModalContextSelector } from '@/context/modal-context'
import UpgradeBtn from '@/app/components/billing/upgrade-btn'
import s from '@/app/components/custom/style.module.css'
import GridMask from '@/app/components/base/grid-mask'
import { useProviderContextSelector } from '@/context/provider-context'
import { IS_CE_EDITION } from '@/config'

export type ModelLoadBalancingConfigsProps = {
  draftConfig?: ModelLoadBalancingConfig
  setDraftConfig: Dispatch<SetStateAction<ModelLoadBalancingConfig | undefined>>
  provider: ModelProvider
  configurationMethod: ConfigurationMethodEnum
  currentCustomConfigurationModelFixedFields?: CustomConfigurationModelFixedFields
  withSwitch?: boolean
  className?: string
}

const ModelLoadBalancingConfigs = ({
  draftConfig,
  setDraftConfig,
  provider,
  configurationMethod,
  currentCustomConfigurationModelFixedFields,
  withSwitch = false,
  className,
}: ModelLoadBalancingConfigsProps) => {
  const { t } = useTranslation()
  const modelLoadBalancingEnabled = useProviderContextSelector(state => state.modelLoadBalancingEnabled)

  const updateConfigEntry = useCallback(
    (
      index: number,
      modifier: (entry: ModelLoadBalancingConfigEntry) => ModelLoadBalancingConfigEntry | undefined,
    ) => {
      setDraftConfig((prev) => {
        if (!prev)
          return prev
        const newConfigs = [...prev.configs]
        const modifiedConfig = modifier(newConfigs[index])
        if (modifiedConfig)
          newConfigs[index] = modifiedConfig
        else
          newConfigs.splice(index, 1)
        return {
          ...prev,
          configs: newConfigs,
        }
      })
    },
    [setDraftConfig],
  )

  const toggleModalBalancing = useCallback((enabled: boolean) => {
    if ((modelLoadBalancingEnabled || !enabled) && draftConfig) {
      setDraftConfig({
        ...draftConfig,
        enabled,
      })
    }
  }, [draftConfig, modelLoadBalancingEnabled, setDraftConfig])

  const toggleConfigEntryEnabled = useCallback((index: number, state?: boolean) => {
    updateConfigEntry(index, entry => ({
      ...entry,
      enabled: typeof state === 'boolean' ? state : !entry.enabled,
    }))
  }, [updateConfigEntry])

  const setShowModelLoadBalancingEntryModal = useModalContextSelector(state => state.setShowModelLoadBalancingEntryModal)

  const toggleEntryModal = useCallback((index?: number, entry?: ModelLoadBalancingConfigEntry) => {
    setShowModelLoadBalancingEntryModal({
      payload: {
        currentProvider: provider,
        currentConfigurationMethod: configurationMethod,
        currentCustomConfigurationModelFixedFields,
        entry,
        index,
      },
      onSaveCallback: ({ entry: result }) => {
        if (entry) {
          // edit
          setDraftConfig(prev => ({
            ...prev,
            enabled: !!prev?.enabled,
            configs: prev?.configs.map((config, i) => i === index ? result! : config) || [],
          }))
        }
        else {
          // add
          setDraftConfig(prev => ({
            ...prev,
            enabled: !!prev?.enabled,
            configs: (prev?.configs || []).concat([{ ...result!, enabled: true }]),
          }))
        }
      },
      onRemoveCallback: ({ index }) => {
        if (index !== undefined && (draftConfig?.configs?.length ?? 0) > index) {
          setDraftConfig(prev => ({
            ...prev,
            enabled: !!prev?.enabled,
            configs: prev?.configs.filter((_, i) => i !== index) || [],
          }))
        }
      },
    })
  }, [
    configurationMethod,
    currentCustomConfigurationModelFixedFields,
    draftConfig?.configs?.length,
    provider,
    setDraftConfig,
    setShowModelLoadBalancingEntryModal,
  ])

  const clearCountdown = useCallback((index: number) => {
    updateConfigEntry(index, ({ ttl: _, ...entry }) => {
      return {
        ...entry,
        in_cooldown: false,
      }
    })
  }, [updateConfigEntry])

  if (!draftConfig)
    return null

  return (
    <>
      <div
        className={classNames(
          'min-h-16 rounded-xl border bg-components-panel-bg transition-colors',
          (withSwitch || !draftConfig.enabled) ? 'border-components-panel-border' : 'border-util-colors-blue-blue-600',
          (withSwitch || draftConfig.enabled) ? 'cursor-default' : 'cursor-pointer',
          className,
        )}
        onClick={(!withSwitch && !draftConfig.enabled) ? () => toggleModalBalancing(true) : undefined}
      >
        <div className='flex select-none items-center gap-2 px-[15px] py-3'>
          <div className='flex h-8 w-8 shrink-0 grow-0 items-center justify-center rounded-lg border border-util-colors-indigo-indigo-100 bg-util-colors-indigo-indigo-50 text-util-colors-blue-blue-600'>
            <Balance className='h-4 w-4' />
          </div>
          <div className='grow'>
            <div className='flex items-center gap-1 text-sm text-text-primary'>
              {t('common.modelProvider.loadBalancing')}
              <Tooltip
                popupContent={t('common.modelProvider.loadBalancingInfo')}
                popupClassName='max-w-[300px]'
                triggerClassName='w-3 h-3'
              />
            </div>
            <div className='text-xs text-text-tertiary'>{t('common.modelProvider.loadBalancingDescription')}</div>
          </div>
          {
            withSwitch && (
              <Switch
                defaultValue={Boolean(draftConfig.enabled)}
                size='l'
                className='ml-3 justify-self-end'
                disabled={!modelLoadBalancingEnabled && !draftConfig.enabled}
                onChange={value => toggleModalBalancing(value)}
              />
            )
          }
        </div>
        {draftConfig.enabled && (
          <div className='flex flex-col gap-1 px-3 pb-3'>
            {draftConfig.configs.map((config, index) => {
              const isProviderManaged = config.name === '__inherit__'
              return (
                <div key={config.id || index} className='group flex h-10 items-center rounded-lg border border-components-panel-border bg-components-panel-on-panel-item-bg px-3 shadow-xs'>
                  <div className='flex grow items-center'>
                    <div className='mr-2 flex h-3 w-3 items-center justify-center'>
                      {(config.in_cooldown && Boolean(config.ttl))
                        ? (
                          <CooldownTimer secondsRemaining={config.ttl} onFinish={() => clearCountdown(index)} />
                        )
                        : (
                          <Tooltip popupContent={t('common.modelProvider.apiKeyStatusNormal')}>
                            <Indicator color='green' />
                          </Tooltip>
                        )}
                    </div>
                    <div className='mr-1 text-[13px]'>
                      {isProviderManaged ? t('common.modelProvider.defaultConfig') : config.name}
                    </div>
                    {isProviderManaged && (
                      <span className='rounded-[5px] border border-divider-regular px-1 text-2xs uppercase text-text-tertiary'>{t('common.modelProvider.providerManaged')}</span>
                    )}
                  </div>
                  <div className='flex items-center gap-1'>
                    {!isProviderManaged && (
                      <>
                        <div className='flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                          <span
                            className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-components-button-secondary-bg text-text-tertiary transition-colors hover:bg-components-button-secondary-bg-hover'
                            onClick={() => toggleEntryModal(index, config)}
                          >
                            <Edit02 className='h-4 w-4' />
                          </span>
                          <span
                            className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-components-button-secondary-bg text-text-tertiary transition-colors hover:bg-components-button-secondary-bg-hover'
                            onClick={() => updateConfigEntry(index, () => undefined)}
                          >
                            <RiDeleteBinLine className='h-4 w-4' />
                          </span>
                          <span className='mr-2 h-3 border-r border-r-divider-subtle' />
                        </div>
                      </>
                    )}
                    <Switch
                      defaultValue={Boolean(config.enabled)}
                      size='md'
                      className='justify-self-end'
                      onChange={value => toggleConfigEntryEnabled(index, value)}
                    />
                  </div>
                </div>
              )
            })}

            <div
              className='mt-1 flex h-8 items-center px-3 text-[13px] font-medium text-primary-600'
              onClick={() => toggleEntryModal()}
            >
              <div className='flex cursor-pointer items-center'>
                <Plus02 className='mr-2 h-3 w-3' />{t('common.modelProvider.addConfig')}
              </div>
            </div>
          </div>
        )}
        {
          draftConfig.enabled && draftConfig.configs.length < 2 && (
            <div className='flex h-[34px] items-center border-t border-t-divider-subtle bg-components-panel-bg px-6 text-xs text-text-secondary'>
              <AlertTriangle className='mr-1 h-3 w-3 text-[#f79009]' />
              {t('common.modelProvider.loadBalancingLeastKeyWarning')}
            </div>
          )
        }
      </div>

      {!modelLoadBalancingEnabled && !IS_CE_EDITION && (
        <GridMask canvasClassName='!rounded-xl'>
          <div className='mt-2 flex h-14 items-center justify-between rounded-xl border-[0.5px] border-components-panel-border px-4 shadow-md'>
            <div
              className={classNames('text-gradient text-sm font-semibold leading-tight', s.textGradient)}
            >
              {t('common.modelProvider.upgradeForLoadBalancing')}
            </div>
            <UpgradeBtn />
          </div>
        </GridMask>
      )}
    </>
  )
}

export default ModelLoadBalancingConfigs
