declare module '@/lib/shared/kliv-database' {
  interface QueryParams {
    [key: string]: string;
  }

  interface DatabaseResult {
    _row_id: number;
    _created_by: string;
    _created_at: string;
    _updated_at: string;
    [key: string]: any;
  }

  interface Database {
    query<T = any>(table: string, params?: QueryParams): Promise<T[]>;
    get<T = any>(table: string, id: string | number): Promise<T | null>;
    insert<T = any>(table: string, data: Record<string, any>): Promise<T>;
    update<T = any>(table: string, filterParams: QueryParams, data: Record<string, any>): Promise<T[]>;
    delete(table: string, filterParams: QueryParams): Promise<void>;
    count(table: string, params?: QueryParams): Promise<number>;
  }

  const db: Database;
  export default db;
}

