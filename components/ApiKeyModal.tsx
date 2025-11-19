import React, { useState, useEffect } from 'react';
import { Key, Save, X } from 'lucide-react';

interface ApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave }) => {
    const [keyInput, setKeyInput] = useState('');
    
    useEffect(() => {
        const stored = localStorage.getItem('gemini_api_key');
        if (stored) setKeyInput(stored);
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (keyInput.trim()) {
            onSave(keyInput.trim());
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
                <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-white font-bold flex items-center">
                        <Key className="w-5 h-5 mr-2" />
                        Configure API Key
                    </h3>
                    <button onClick={onClose} className="text-indigo-200 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-sm text-gray-600 mb-4">
                        To use the AI Rescue Plan feature, you need a Google Gemini API key.
                        The key is stored locally in your browser.
                    </p>
                    
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gemini API Key
                    </label>
                    <input 
                        type="password" 
                        value={keyInput}
                        onChange={(e) => setKeyInput(e.target.value)}
                        placeholder="AIzaSy..."
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border bg-white mb-4"
                    />
                    
                    <div className="flex justify-end space-x-3">
                        <button 
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave}
                            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Save Key
                        </button>
                    </div>
                    
                    <div className="mt-4 text-xs text-gray-400 text-center">
                        Get a key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">Google AI Studio</a>
                    </div>
                </div>
            </div>
        </div>
    );
};