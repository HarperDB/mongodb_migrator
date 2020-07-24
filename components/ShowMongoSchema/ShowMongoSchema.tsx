import { Collapse } from 'antd'
import ShowMongoCollection from '../ShowMongoCollection/ShowMongoCollection'
import { IMongoSchema, ISelectMongo } from '../../types/Mongodb'

const { Panel } = Collapse

export interface ShowMongoSchemaProps {
    mongoSchemas: IMongoSchema[]
    onSelected: any
    currentValue: ISelectMongo
}

const ShowMongoSchema: React.SFC<ShowMongoSchemaProps> = ({
    mongoSchemas = [],
    onSelected,
    currentValue,
}) => {
    const onChangeMongo = (val: ISelectMongo) => {
        onSelected(val)
    }

    return (
        <div>
            <Collapse accordion>
                {mongoSchemas.map((mong) => {
                    return (
                        <Panel key={mong.schemaName} header={mong.schemaName}>
                            <ShowMongoCollection
                                databaseName={mong.schemaName}
                                currentValue={currentValue}
                                onChange={onChangeMongo}
                                collections={mong.collections}
                            />
                        </Panel>
                    )
                })}
            </Collapse>
        </div>
    )
}

export default ShowMongoSchema
