import React from 'react'
import { X, Volume2, Send, Clock } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useSettings()

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-[100]">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-auto">
          <div className="glass-effect rounded-2xl overflow-hidden shadow-xl transform transition-all">
            <div className="flex items-center justify-between px-6 py-4 border-b border-blue-900/20">
              <h2 className="text-xl font-semibold text-blue-300">Settings</h2>
              <button onClick={onClose} className="p-2 hover:bg-blue-900/20 rounded-full transition-colors">
                <X className="h-5 w-5 text-blue-400" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-900/30 rounded-lg">
                      <Send className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-200">Auto Send</h3>
                      <p className="text-sm text-blue-300/70">Send message when recording stops</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoSend}
                      onChange={(e) => updateSettings({ autoSend: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-900/30 rounded-lg">
                      <Volume2 className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-200">Auto Play Responses</h3>
                      <p className="text-sm text-blue-300/70">Play AI responses automatically</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoPlayResponses}
                      onChange={(e) => updateSettings({ autoPlayResponses: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-900/30 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-200">Response Delay</h3>
                      <p className="text-sm text-blue-300/70">Add natural delay between messages</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.useResponseDelay}
                      onChange={(e) => updateSettings({ useResponseDelay: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SettingsModal
