export interface ITaskRepository {
    create(document:any): Promise<string>; // ✅ Ahora acepta processedData
    update(id: string, updates: any): Promise<void>;
    getById(id: string): Promise<any>;
    addOneErrorCount(id: string): Promise<void>;
    addOneNewPeopleCount(id: string): Promise<void>;
  }
  