import React, { useState, useRef, useEffect } from 'react';
import useAppStore from '../store/useAppStore';

const Sidebar: React.FC = () => {
  const { 
    conversations, 
    activeConversationId, 
    setActiveConversationId, 
    deleteConversation,
    updateConversationTitle,
    returnToAgentSelection,
  } = useAppStore();
  
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [titleInput, setTitleInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingConvId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingConvId]);

  const sortedConversations = [...conversations].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  
  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      deleteConversation(id);
      setMenuOpenFor(null);
  };

  const handleRenameClick = (e: React.MouseEvent, conv: typeof conversations[0]) => {
    e.stopPropagation();
    setEditingConvId(conv.id);
    setTitleInput(conv.title);
    setMenuOpenFor(null);
  };
  
  const handleTitleSave = () => {
    const idToUpdate = editingConvId;
    const newTitle = titleInput.trim();

    // Exit editing mode first to prevent UI race conditions.
    setEditingConvId(null);

    // If we were in editing mode and the title is valid, update it.
    if (idToUpdate && newTitle) {
      updateConversationTitle(idToUpdate, newTitle);
    }
  };
  
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setEditingConvId(null);
    }
  };

  return (
    <aside className="w-64 bg-white rounded-lg shadow-lg border border-greatek-border flex flex-col p-4 animate-fade-in">
      <button
        onClick={returnToAgentSelection}
        className="flex items-center justify-center w-full px-4 py-2 mb-4 text-sm font-semibold text-white bg-greatek-blue rounded-lg hover:bg-greatek-dark-blue transition-colors focus:outline-none focus:ring-2 focus:ring-greatek-blue"
      >
        <i className="bi bi-plus-square mr-2"></i>
        Nova Conversa
      </button>
      <div className="flex-grow overflow-y-auto -mr-2 pr-2">
        <h2 className="text-xs font-bold text-text-secondary/60 uppercase tracking-wider mb-2">Histórico</h2>
        <nav className="space-y-1">
          {sortedConversations.map((conv) => (
            <div key={conv.id} className="relative group">
              <button
                type="button"
                onClick={() => {
                  if (!editingConvId) {
                    setActiveConversationId(conv.id);
                  }
                }}
                className={`flex items-center w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeConversationId === conv.id
                    ? 'bg-greatek-blue/10 text-greatek-blue'
                    : 'text-text-secondary hover:bg-greatek-bg-light'
                }`}
              >
                <i className="bi bi-chat-left-text w-5 h-5 mr-3 flex-shrink-0"></i>
                {editingConvId === conv.id ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onKeyDown={handleTitleKeyDown}
                    onBlur={handleTitleSave}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-white border border-greatek-blue rounded text-sm p-0.5 -m-0.5 focus:outline-none"
                  />
                ) : (
                   <span className="truncate flex-1">{conv.title}</span>
                )}
              </button>
              {editingConvId !== conv.id && (
                <div className="absolute right-1 top-1/2 -translate-y-1/2">
                    <button onClick={() => setMenuOpenFor(menuOpenFor === conv.id ? null : conv.id)} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                        <i className="bi bi-three-dots-vertical"></i>
                    </button>
                    {menuOpenFor === conv.id && (
                        <div className="absolute right-0 mt-2 w-32 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1" role="menu" aria-orientation="vertical">
                                <button type="button" onClick={(e) => handleRenameClick(e, conv)} className="w-full flex items-center text-gray-700 px-4 py-2 text-sm hover:bg-gray-100" role="menuitem">
                                    <i className="bi bi-pencil mr-2"></i>
                                    Renomear
                                </button>
                                <button type="button" onClick={(e) => handleDelete(e, conv.id)} className="w-full flex items-center text-red-600 px-4 py-2 text-sm hover:bg-gray-100" role="menuitem">
                                    <i className="bi bi-trash3 mr-2"></i>
                                    Deletar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
