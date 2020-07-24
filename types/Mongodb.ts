export interface IMongoSchema {
    schemaName: string
    collections: IMongoCollection[]
}

export interface IMongoCollection {
    name?: string
    type?: string
    options?: any
    info?: any
    idIndex?: any
}

export interface ISelectMongo {
    database: string
    collection: string
}
