'use client'
import type { FC } from 'react'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { produce } from 'immer'
import RemoveButton from '../remove-button'
import VarReferencePicker from './var-reference-picker'
import Input from '@/app/components/base/input'
import type { ValueSelector, Var, Variable } from '@/app/components/workflow/types'
import { VarType as VarKindType } from '@/app/components/workflow/nodes/tool/types'
import { checkKeys } from '@/utils/var'
import Toast from '@/app/components/base/toast'

type Props = {
  nodeId: string
  readonly: boolean
  list: Variable[]
  onChange: (list: Variable[]) => void
  onVarNameChange?: (oldName: string, newName: string) => void
  isSupportConstantValue?: boolean
  onlyLeafNodeVar?: boolean
  filterVar?: (payload: Var, valueSelector: ValueSelector) => boolean
  isSupportFileVar?: boolean
}

const VarList: FC<Props> = ({
  nodeId,
  readonly,
  list,
  onChange,
  onVarNameChange,
  isSupportConstantValue,
  onlyLeafNodeVar,
  filterVar,
  isSupportFileVar = true,
}) => {
  const { t } = useTranslation()

  const handleVarNameChange = useCallback((index: number) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const newKey = e.target.value
      const { isValid, errorKey, errorMessageKey } = checkKeys([newKey], true)
      if (!isValid) {
        Toast.notify({
          type: 'error',
          message: t(`appDebug.varKeyError.${errorMessageKey}`, { key: errorKey }),
        })
        return
      }

      if (list.map(item => item.variable?.trim()).includes(newKey.trim())) {
        Toast.notify({
          type: 'error',
          message: t('appDebug.varKeyError.keyAlreadyExists', { key: newKey }),
        })
        return
      }

      onVarNameChange?.(list[index].variable, newKey)
      const newList = produce(list, (draft) => {
        draft[index].variable = newKey
      })
      onChange(newList)
    }
  }, [list, onVarNameChange, onChange])

  const handleVarReferenceChange = useCallback((index: number) => {
    return (value: ValueSelector | string, varKindType: VarKindType) => {
      const newList = produce(list, (draft) => {
        if (!isSupportConstantValue || varKindType === VarKindType.variable) {
          draft[index].value_selector = value as ValueSelector
          if (isSupportConstantValue)
            draft[index].variable_type = VarKindType.variable

          if (!draft[index].variable)
            draft[index].variable = value[value.length - 1]
        }
        else {
          draft[index].variable_type = VarKindType.constant
          draft[index].value_selector = value as ValueSelector
          draft[index].value = value as string
        }
      })
      onChange(newList)
    }
  }, [isSupportConstantValue, list, onChange])

  const handleVarRemove = useCallback((index: number) => {
    return () => {
      const newList = produce(list, (draft) => {
        draft.splice(index, 1)
      })
      onChange(newList)
    }
  }, [list, onChange])

  return (
    <div className='space-y-2'>
      {list.map((item, index) => (
        <div className='flex items-center space-x-1' key={index}>
          <Input
            wrapperClassName='w-[120px]'
            disabled={readonly}
            value={list[index].variable}
            onChange={handleVarNameChange(index)}
            placeholder={t('workflow.common.variableNamePlaceholder')!}
          />
          <VarReferencePicker
            nodeId={nodeId}
            readonly={readonly}
            isShowNodeName
            className='grow'
            value={item.variable_type === VarKindType.constant ? (item.value || '') : (item.value_selector || [])}
            isSupportConstantValue={isSupportConstantValue}
            onChange={handleVarReferenceChange(index)}
            defaultVarKindType={item.variable_type}
            onlyLeafNodeVar={onlyLeafNodeVar}
            filterVar={filterVar}
            isSupportFileVar={isSupportFileVar}
          />
          {!readonly && (
            <RemoveButton onClick={handleVarRemove(index)}/>
          )}
        </div>
      ))}
    </div>
  )
}
export default React.memo(VarList)
