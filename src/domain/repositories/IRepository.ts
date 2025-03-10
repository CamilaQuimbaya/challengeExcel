export interface IRepository {
  create(document:any): Promise<string>; // ✅ Ahora acepta processedData
  update(id: string, updates: any): Promise<void>;
  getById(id: string): Promise<any>;
}
