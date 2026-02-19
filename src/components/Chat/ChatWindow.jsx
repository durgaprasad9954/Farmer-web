import React, { useState } from 'react'
import ChatHeader from './ChatHeader'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import { useChat } from '../../hooks/useChat'
import { useLanguage } from '../../context/LanguageContext'
import './ChatWindow.css'

export default function ChatWindow({ onMenuClick }) {
  const { lang } = useLanguage()
  const [apiMode, setApiMode] = useState('upload') // 'text' | 'upload'
  const { messages, isLoading, error, sendText, sendImage, clearError } = useChat(lang)

  return (
    <div className="chat-window">
      <ChatHeader
        onMenuClick={onMenuClick}
        apiMode={apiMode}
        onApiModeChange={setApiMode}
      />
      <MessageList
        messages={messages}
        isLoading={isLoading}
        error={error}
        onClearError={clearError}
      />
      <MessageInput
        onSendText={sendText}
        onSendImage={sendImage}
        isLoading={isLoading}
      />
    </div>
  )
}
