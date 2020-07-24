export interface IHarperSchema {
    schemaName: string
    tables: IHarperTable[]
}

export interface IHarperTable {
    __createdtime__: number
    __updatedtime__: IHarperTable
    hash_attribute: string
    id: string
    name: string
    residence: string
    schema: string
    record_count?: number
    attributes?: any[]
}

export interface ISelectHarper {
    schemaName: string
    tableName: string
}
