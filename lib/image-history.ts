// Image History Management
export interface ImageHistoryItem {
  id: string;
  prompt: string;
  imageUrl: string;
  model: 'dall-e-3' | 'gemini-2.5-flash' | 'imagen-4';
  timestamp: string;
  revisedPrompt?: string;
  size?: string;
  quality?: string;
  style?: string;
  aspectRatio?: string;
  isEdited?: boolean;
  parentId?: string; // For tracking edit chains
  editPrompt?: string; // The prompt used for editing
}

export class ImageHistoryManager {
  private static readonly STORAGE_KEY = 'image-generation-history';
  private static readonly MAX_HISTORY = 50;
  
  // Save image to history
  static saveImage(item: Omit<ImageHistoryItem, 'id' | 'timestamp'>): ImageHistoryItem {
    const historyItem: ImageHistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };
    
    const history = this.getHistory();
    history.unshift(historyItem);
    
    // Limit history size
    if (history.length > this.MAX_HISTORY) {
      history.splice(this.MAX_HISTORY);
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    }
    
    return historyItem;
  }
  
  // Get all history
  static getHistory(): ImageHistoryItem[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
  
  // Get single item
  static getItem(id: string): ImageHistoryItem | null {
    const history = this.getHistory();
    return history.find(item => item.id === id) || null;
  }
  
  // Get edit chain for an image
  static getEditChain(id: string): ImageHistoryItem[] {
    const history = this.getHistory();
    const chain: ImageHistoryItem[] = [];
    
    // Find the original image
    let currentId: string | undefined = id;
    while (currentId) {
      const item = history.find(h => h.id === currentId);
      if (item) {
        chain.unshift(item);
        currentId = item.parentId;
      } else {
        break;
      }
    }
    
    // Find all edits derived from this image
    const findChildren = (parentId: string) => {
      const children = history.filter(h => h.parentId === parentId);
      for (const child of children) {
        if (!chain.find(c => c.id === child.id)) {
          chain.push(child);
          findChildren(child.id);
        }
      }
    };
    
    findChildren(id);
    
    return chain;
  }
  
  // Delete item
  static deleteItem(id: string): boolean {
    const history = this.getHistory();
    const index = history.findIndex(item => item.id === id);
    
    if (index !== -1) {
      history.splice(index, 1);
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
      }
      return true;
    }
    
    return false;
  }
  
  // Clear all history
  static clearHistory(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }
  
  // Get history by model
  static getByModel(model: ImageHistoryItem['model']): ImageHistoryItem[] {
    return this.getHistory().filter(item => item.model === model);
  }
  
  // Get recent items
  static getRecent(count: number = 10): ImageHistoryItem[] {
    return this.getHistory().slice(0, count);
  }
  
  // Search history by prompt
  static searchByPrompt(query: string): ImageHistoryItem[] {
    const lowerQuery = query.toLowerCase();
    return this.getHistory().filter(item => 
      item.prompt.toLowerCase().includes(lowerQuery) ||
      item.revisedPrompt?.toLowerCase().includes(lowerQuery) ||
      item.editPrompt?.toLowerCase().includes(lowerQuery)
    );
  }
  
  // Export history as JSON
  static exportHistory(): string {
    return JSON.stringify(this.getHistory(), null, 2);
  }
  
  // Import history from JSON
  static importHistory(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data)) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}