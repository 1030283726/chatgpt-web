import * as dotenv from 'dotenv'
import OpenAI from 'openai'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { tavily } from '@tavily/core'
import dayjs from 'dayjs'
import type { AuditConfig, KeyConfig, UserInfo } from '../storage/model'
import { Status, UsageResponse } from '../storage/model'
import { convertImageUrl } from '../utils/image'
import type { TextAuditService } from '../utils/textAudit'
import { textAuditServices } from '../utils/textAudit'
import { getCacheApiKeys, getCacheConfig, getOriginConfig } from '../storage/config'
import { sendResponse } from '../utils'
import { hasAnyRole, isNotEmptyString } from '../utils/is'
import type { ModelConfig } from '../types'
import { getChatByMessageId, updateChatSearchQuery, updateChatSearchResult } from '../storage/mongo'
import type { ChatMessage, RequestOptions } from './types'

dotenv.config()

function renderSystemMessage(template: string, currentTime: string): string {
  return template.replace(/{current_time}/g, currentTime)
}

const ErrorCodeMessage: Record<string, string> = {
  401: '[OpenAI] 提供錯誤的API密鑰 | Incorrect API key provided',
  403: '[OpenAI] 服務器拒絕訪問，請稍後再試 | Server refused to access, please try again later',
  502: '[OpenAI] 錯誤的網關 |  Bad Gateway',
  503: '[OpenAI] 服務器繁忙，請稍後再試 | Server is busy, please try again later',
  504: '[OpenAI] 網關超時 | Gateway Time-out',
  500: '[OpenAI] 服務器繁忙，請稍後再試 | Internal Server Error',
}

let auditService: TextAuditService
const _lockedKeys: { key: string; lockedTime: number }[] = []

export async function initApi(key: KeyConfig) {
  const config = await getCacheConfig()
  const openaiBaseUrl = isNotEmptyString(key.baseUrl) ? key.baseUrl : config.apiBaseUrl

  let httpAgent: HttpsProxyAgent<any> | undefined
  if (isNotEmptyString(config.httpsProxy)) {
    const httpsProxy = config.httpsProxy
    if (httpsProxy)
      httpAgent = new HttpsProxyAgent(httpsProxy)
  }

  const client = new OpenAI({
    baseURL: openaiBaseUrl,
    apiKey: key.key,
    httpAgent,
  })
  return client
}

const processThreads: { userId: string; abort: AbortController; messageId: string }[] = []

async function chatReplyProcess(options: RequestOptions) {
  const globalConfig = await getCacheConfig()
  const model = options.room.chatModel
  const searchEnabled = options.room.searchEnabled
  const key = await getRandomApiKey(options.user, model)
  const userId = options.user._id.toString()
  const maxContextCount = options.user.advanced.maxContextCount ?? 20
  const messageId = options.messageId
  if (key == null || key === undefined)
    throw new Error('沒有對應的apikeys配置。請再試一次 | No available apikeys configuration. Please try again.')

  const { message, uploadFileKeys, parentMessageId, process, systemMessage, temperature, top_p } = options

  try {
    // Initialize OpenAI client
    const openai = await initApi(key)

    // Create abort controller for cancellation
    const abort = new AbortController()
    processThreads.push({ userId, abort, messageId })

    // Prepare messages array for the chat completion
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = []

    // Add previous messages from conversation history.
    await addPreviousMessages(parentMessageId, maxContextCount, messages)

    // Add system message if provided
    if (isNotEmptyString(systemMessage)) {
      messages.unshift({
        role: 'system',
        content: systemMessage,
      })
    }

    // Prepare the user message content (text and images)
    const content: string | OpenAI.Chat.ChatCompletionContentPart[] = await createContent(message, uploadFileKeys)

    // Add the user message
    messages.push({
      role: 'user',
      content,
    })

    let hasSearchResult = false
    const searchConfig = globalConfig.searchConfig
    if (searchConfig.enabled && searchConfig?.options?.apiKey && searchEnabled) {
      messages[0].content = renderSystemMessage(searchConfig.systemMessageGetSearchQuery, dayjs().format('YYYY-MM-DD HH:mm:ss'))
      const completion = await openai.chat.completions.create({
        model,
        messages,
      })
      let searchQuery: string = completion.choices[0].message.content
      const match = searchQuery.match(/<search_query>([\s\S]*)<\/search_query>/i)
      if (match)
        searchQuery = match[1].trim()
      else
        searchQuery = ''

      if (searchQuery) {
        await updateChatSearchQuery(messageId, searchQuery)

        const tvly = tavily({ apiKey: searchConfig.options?.apiKey })
        const response = await tvly.search(
          searchQuery,
          {
            includeRawContent: true,
            timeout: 300,
          },
        )

        const searchResult = JSON.stringify(response)
        await updateChatSearchResult(messageId, searchResult)

        messages.push({
          role: 'user',
          content: `Additional information from web searche engine.
search query: <search_query>${searchQuery}</search_query>
search result: <search_result>${searchResult}</search_result>`,
        })

        messages[0].content = renderSystemMessage(searchConfig.systemMessageWithSearchResult, dayjs().format('YYYY-MM-DD HH:mm:ss'))
        hasSearchResult = true
      }
    }

    if (!hasSearchResult)
      messages[0].content = systemMessage

    // Create the chat completion with streaming
    const stream = await openai.chat.completions.create({
      model,
      messages,
      temperature: temperature ?? undefined,
      top_p: top_p ?? undefined,
      stream: true,
      stream_options: {
        include_usage: true,
      },
    }, {
      signal: abort.signal,
    })

    // Process the stream
    let responseReasoning = ''
    let responseText = ''
    let responseId = ''
    const usage = new UsageResponse()

    for await (const chunk of stream) {
      // Extract the content from the chunk
      // @ts-expect-error For deepseek-reasoner model only. The reasoning contents of the assistant message, before the final answer.
      const reasoningContent = chunk.choices[0]?.delta?.reasoning_content || ''
      responseReasoning += reasoningContent
      const content = chunk.choices[0]?.delta?.content || ''
      responseText += content
      responseId = chunk.id

      const finish_reason = chunk.choices[0]?.finish_reason

      // Build response object similar to the original implementation
      const responseChunk = {
        id: chunk.id,
        reasoning: responseReasoning,
        text: responseText,
        role: 'assistant',
        finish_reason,
      }

      // Call the process callback if provided
      process?.(responseChunk)

      if (chunk?.usage?.total_tokens) {
        usage.total_tokens = chunk?.usage?.total_tokens
        usage.prompt_tokens = chunk?.usage?.prompt_tokens
        usage.completion_tokens = chunk?.usage?.completion_tokens
      }
    }

    // Final response object
    const response = {
      id: responseId || messageId,
      reasoning: responseReasoning,
      text: responseText,
      role: 'assistant',
      detail: {
        usage,
      },
    }

    return sendResponse({ type: 'Success', data: response })
  }
  catch (error: any) {
    const code = error.status || error.statusCode
    globalThis.console.error(error)
    if (Reflect.has(ErrorCodeMessage, code))
      return sendResponse({ type: 'Fail', message: ErrorCodeMessage[code] })
    return sendResponse({ type: 'Fail', message: error.message ?? 'Please check the back-end console' })
  }
  finally {
    const index = processThreads.findIndex(d => d.userId === userId)
    if (index > -1)
      processThreads.splice(index, 1)
  }
}

export function abortChatProcess(userId: string) {
  const index = processThreads.findIndex(d => d.userId === userId)
  if (index <= -1)
    return
  const messageId = processThreads[index].messageId
  processThreads[index].abort.abort()
  processThreads.splice(index, 1)
  return messageId
}

export function initAuditService(audit: AuditConfig) {
  if (!audit || !audit.options || !audit.options.apiKey || !audit.options.apiSecret)
    return
  const Service = textAuditServices[audit.provider]
  auditService = new Service(audit.options)
}

async function containsSensitiveWords(audit: AuditConfig, text: string): Promise<boolean> {
  if (audit.customizeEnabled && isNotEmptyString(audit.sensitiveWords)) {
    const textLower = text.toLowerCase()
    const notSafe = audit.sensitiveWords.split('\n').filter(d => textLower.includes(d.trim().toLowerCase())).length > 0
    if (notSafe)
      return true
  }
  if (audit.enabled) {
    if (!auditService)
      initAuditService(audit)
    return await auditService.containsSensitiveWords(text)
  }
  return false
}

async function chatConfig() {
  const config = await getOriginConfig() as ModelConfig
  return sendResponse<ModelConfig>({
    type: 'Success',
    data: config,
  })
}

async function getMessageById(id: string): Promise<ChatMessage | undefined> {
  const isPrompt = id.startsWith('prompt_')
  const chatInfo = await getChatByMessageId(isPrompt ? id.substring(7) : id)

  if (chatInfo) {
    const parentMessageId = isPrompt
      ? chatInfo.options.parentMessageId
      : `prompt_${id}` // parent message is the prompt

    if (chatInfo.status !== Status.Normal) { // jumps over deleted messages
      return parentMessageId
        ? getMessageById(parentMessageId)
        : undefined
    }
    else {
      if (isPrompt) { // prompt
        const content: string | OpenAI.Chat.ChatCompletionContentPart[] = await createContent(chatInfo.prompt, chatInfo.images)
        return {
          id,
          parentMessageId,
          role: 'user',
          content,
        }
      }
      else {
        return { // completion
          id,
          parentMessageId,
          role: 'assistant',
          content: chatInfo.response,
        }
      }
    }
  }
  else { return undefined }
}

async function randomKeyConfig(keys: KeyConfig[]): Promise<KeyConfig | null> {
  if (keys.length <= 0)
    return null
  // cleanup old locked keys
  _lockedKeys.filter(d => d.lockedTime <= Date.now() - 1000 * 20).forEach(d => _lockedKeys.splice(_lockedKeys.indexOf(d), 1))

  let unsedKeys = keys.filter(d => _lockedKeys.filter(l => d.key === l.key).length <= 0)
  const start = Date.now()
  while (unsedKeys.length <= 0) {
    if (Date.now() - start > 3000)
      break
    await new Promise(resolve => setTimeout(resolve, 1000))
    unsedKeys = keys.filter(d => _lockedKeys.filter(l => d.key === l.key).length <= 0)
  }
  if (unsedKeys.length <= 0)
    return null
  const thisKey = unsedKeys[Math.floor(Math.random() * unsedKeys.length)]
  return thisKey
}

async function getRandomApiKey(user: UserInfo, chatModel: string): Promise<KeyConfig | undefined> {
  const keys = (await getCacheApiKeys()).filter(d => hasAnyRole(d.userRoles, user.roles))
    .filter(d => d.chatModels.includes(chatModel))

  return randomKeyConfig(keys)
}

// Helper function to create content with text and optional images
async function createContent(text: string, images?: string[]): Promise<string | OpenAI.Chat.ChatCompletionContentPart[]> {
  // If no images or empty array, return just the text
  if (!images || images.length === 0)
    return text

  // Create content with text and images
  const content: OpenAI.Chat.ChatCompletionContentPart[] = [
    {
      type: 'text',
      text,
    },
  ]

  for (const image of images) {
    const imageUrl = await convertImageUrl(image)
    if (imageUrl) {
      content.push({
        type: 'image_url',
        image_url: {
          url: imageUrl,
        },
      })
    }
  }

  return content
}

// Helper function to add previous messages to the conversation context
async function addPreviousMessages(parentMessageId: string, maxContextCount: number, messages: OpenAI.Chat.ChatCompletionMessageParam[]): Promise<void> {
  // Recursively get previous messages
  let currentMessageId = parentMessageId

  while (currentMessageId) {
    const currentChatMessage: ChatMessage | undefined = await getMessageById(currentMessageId)

    messages.unshift({
      content: currentChatMessage.content,
      role: currentChatMessage.role,
    } as OpenAI.Chat.ChatCompletionMessage)

    currentMessageId = currentChatMessage?.parentMessageId

    if (messages.length >= maxContextCount)
      break
  }
}

export { chatReplyProcess, chatConfig, containsSensitiveWords }
