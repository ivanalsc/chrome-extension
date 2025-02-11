import { useState, useEffect } from 'react';
import { SavedItem } from './types/types';

const App = () => {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [note, setNote] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [currentTitle, setCurrentTitle] = useState('');

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['savedItems'], (result) => {
        if (result.savedItems) {
          setItems(result.savedItems);
        }
      });

      if (chrome.tabs) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.url) {
            setCurrentUrl(tabs[0].url);
            setCurrentTitle(tabs[0].title || '');
          }
        });
      }
    }
  }, []);

  const saveItem = () => {
    const newItem: SavedItem = {
      id: Date.now().toString(),
      url: currentUrl,
      title: currentTitle,
      note: note,
      createdAt: Date.now()
    };

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ savedItems: updatedItems });
    }
    setNote('');
  };

  const deleteItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ savedItems: updatedItems });
    }
  };

  return (
    <div className="min-w-[400px] min-h-[500px] max-h-[600px] bg-gray-50">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-800">Link & Note Saver</h1>
      </div>

      <div className="p-4">
        <div className="mb-4 bg-white rounded-lg shadow">
          <div className="p-3 border-b border-gray-100">
            <p className="text-sm text-gray-600 truncate">
              URL actual: {currentUrl}
            </p>
          </div>
          
          <div className="p-3">
            <textarea
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Añade una nota..."
            />
            <button
              onClick={saveItem}
              className="w-full mt-2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
            >
              Guardar
            </button>
          </div>
        </div>

        <div className="space-y-3 overflow-y-auto max-h-[300px]">
          {items.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              No hay elementos guardados
            </p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="bg-white p-3 rounded-lg shadow">
                {item.url && (
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-500 hover:underline text-sm block truncate"
                  >
                    {item.title || item.url}
                  </a>
                )}
                {item.note && (
                  <p className="mt-2 text-gray-600 text-sm border-t border-gray-100 pt-2">
                    {item.note}
                  </p>
                )}
                <button
                  onClick={() => deleteItem(item.id)}
                  className="mt-2 text-red-500 text-xs hover:text-red-600 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default App;