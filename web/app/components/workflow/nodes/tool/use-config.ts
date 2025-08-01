import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { produce } from 'immer'
import { useBoolean } from 'ahooks'
import { useStore } from '../../store'
import type { ToolNodeType, ToolVarInputs } from './types'
import { useLanguage } from '@/app/components/header/account-setting/model-provider-page/hooks'
import useNodeCrud from '@/app/components/workflow/nodes/_base/hooks/use-node-crud'
import { CollectionType } from '@/app/components/tools/types'
import { updateBuiltInToolCredential } from '@/service/tools'
import { addDefaultValue, toolParametersToFormSchemas } from '@/app/components/tools/utils/to-form-schema'
import Toast from '@/app/components/base/toast'
import { VarType as VarVarType } from '@/app/components/workflow/types'
import type { InputVar, Var } from '@/app/components/workflow/types'
import {
  useFetchToolsData,
  useNodesReadOnly,
} from '@/app/components/workflow/hooks'
import { canFindTool } from '@/utils'

const useConfig = (id: string, payload: ToolNodeType) => {
  const { nodesReadOnly: readOnly } = useNodesReadOnly()
  const { handleFetchAllTools } = useFetchToolsData()
  const { t } = useTranslation()

  const language = useLanguage()
  const { inputs, setInputs: doSetInputs } = useNodeCrud<ToolNodeType>(id, payload)
  /*
  * tool_configurations: tool setting, not dynamic setting
  * tool_parameters: tool dynamic setting(by user)
  * output_schema: tool dynamic output
  */
  const { provider_id, provider_type, tool_name, tool_configurations, output_schema } = inputs
  const isBuiltIn = provider_type === CollectionType.builtIn
  const buildInTools = useStore(s => s.buildInTools)
  const customTools = useStore(s => s.customTools)
  const workflowTools = useStore(s => s.workflowTools)

  const currentTools = (() => {
    switch (provider_type) {
      case CollectionType.builtIn:
        return buildInTools
      case CollectionType.custom:
        return customTools
      case CollectionType.workflow:
        return workflowTools
      default:
        return []
    }
  })()
  const currCollection = currentTools.find(item => canFindTool(item.id, provider_id))

  // Auth
  const needAuth = !!currCollection?.allow_delete
  const isAuthed = !!currCollection?.is_team_authorization
  const isShowAuthBtn = isBuiltIn && needAuth && !isAuthed
  const [showSetAuth, {
    setTrue: showSetAuthModal,
    setFalse: hideSetAuthModal,
  }] = useBoolean(false)

  const handleSaveAuth = useCallback(async (value: any) => {
    await updateBuiltInToolCredential(currCollection?.name as string, value)

    Toast.notify({
      type: 'success',
      message: t('common.api.actionSuccess'),
    })
    handleFetchAllTools(provider_type)
    hideSetAuthModal()
  }, [currCollection?.name, hideSetAuthModal, t, handleFetchAllTools, provider_type])

  const currTool = currCollection?.tools.find(tool => tool.name === tool_name)
  const formSchemas = useMemo(() => {
    return currTool ? toolParametersToFormSchemas(currTool.parameters) : []
  }, [currTool])
  const toolInputVarSchema = formSchemas.filter((item: any) => item.form === 'llm')
  // use setting
  const toolSettingSchema = formSchemas.filter((item: any) => item.form !== 'llm')
  const hasShouldTransferTypeSettingInput = toolSettingSchema.some(item => item.type === 'boolean' || item.type === 'number-input')

  const setInputs = useCallback((value: ToolNodeType) => {
    if (!hasShouldTransferTypeSettingInput) {
      doSetInputs(value)
      return
    }
    const newInputs = produce(value, (draft) => {
      const newConfig = { ...draft.tool_configurations }
      Object.keys(draft.tool_configurations).forEach((key) => {
        const schema = formSchemas.find(item => item.variable === key)
        const value = newConfig[key]
        if (schema?.type === 'boolean') {
          if (typeof value === 'string')
            newConfig[key] = Number.parseInt(value, 10)

          if (typeof value === 'boolean')
            newConfig[key] = value ? 1 : 0
        }

        if (schema?.type === 'number-input') {
          if (typeof value === 'string' && value !== '')
            newConfig[key] = Number.parseFloat(value)
        }
      })
      draft.tool_configurations = newConfig
    })
    doSetInputs(newInputs)
  }, [doSetInputs, formSchemas, hasShouldTransferTypeSettingInput])
  const [notSetDefaultValue, setNotSetDefaultValue] = useState(false)
  const toolSettingValue = (() => {
    if (notSetDefaultValue)
      return tool_configurations

    return addDefaultValue(tool_configurations, toolSettingSchema)
  })()
  const setToolSettingValue = useCallback((value: Record<string, any>) => {
    setNotSetDefaultValue(true)
    setInputs({
      ...inputs,
      tool_configurations: value,
    })
  }, [inputs, setInputs])

  useEffect(() => {
    if (!currTool)
      return
    const inputsWithDefaultValue = produce(inputs, (draft) => {
      if (!draft.tool_configurations || Object.keys(draft.tool_configurations).length === 0)
        draft.tool_configurations = addDefaultValue(tool_configurations, toolSettingSchema)

      if (!draft.tool_parameters)
        draft.tool_parameters = {}
    })
    setInputs(inputsWithDefaultValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currTool])

  // setting when call
  const setInputVar = useCallback((value: ToolVarInputs) => {
    setInputs({
      ...inputs,
      tool_parameters: value,
    })
  }, [inputs, setInputs])

  const [currVarIndex, setCurrVarIndex] = useState(-1)
  const currVarType = toolInputVarSchema[currVarIndex]?._type
  const handleOnVarOpen = useCallback((index: number) => {
    setCurrVarIndex(index)
  }, [])

  const filterVar = useCallback((varPayload: Var) => {
    if (currVarType)
      return varPayload.type === currVarType

    return varPayload.type !== VarVarType.arrayFile
  }, [currVarType])

  const isLoading = currTool && (isBuiltIn ? !currCollection : false)

  const getMoreDataForCheckValid = () => {
    return {
      toolInputsSchema: (() => {
        const formInputs: InputVar[] = []
        toolInputVarSchema.forEach((item: any) => {
          formInputs.push({
            label: item.label[language] || item.label.en_US,
            variable: item.variable,
            type: item.type,
            required: item.required,
          })
        })
        return formInputs
      })(),
      notAuthed: isShowAuthBtn,
      toolSettingSchema,
      language,
    }
  }

  const outputSchema = useMemo(() => {
    const res: any[] = []
    if (!output_schema)
      return []
    Object.keys(output_schema.properties).forEach((outputKey) => {
      const output = output_schema.properties[outputKey]
      const type = output.type
      if (type === 'object') {
        res.push({
          name: outputKey,
          value: output,
        })
      }
      else {
        res.push({
          name: outputKey,
          type: output.type === 'array'
            ? `Array[${output.items?.type.slice(0, 1).toLocaleUpperCase()}${output.items?.type.slice(1)}]`
            : `${output.type.slice(0, 1).toLocaleUpperCase()}${output.type.slice(1)}`,
          description: output.description,
        })
      }
    })
    return res
  }, [output_schema])

  const hasObjectOutput = useMemo(() => {
    if (!output_schema)
      return false
    const properties = output_schema.properties
    return Object.keys(properties).some(key => properties[key].type === 'object')
  }, [output_schema])

  return {
    readOnly,
    inputs,
    currTool,
    toolSettingSchema,
    toolSettingValue,
    setToolSettingValue,
    toolInputVarSchema,
    setInputVar,
    handleOnVarOpen,
    filterVar,
    currCollection,
    isShowAuthBtn,
    showSetAuth,
    showSetAuthModal,
    hideSetAuthModal,
    handleSaveAuth,
    isLoading,
    outputSchema,
    hasObjectOutput,
    getMoreDataForCheckValid,
  }
}

export default useConfig
