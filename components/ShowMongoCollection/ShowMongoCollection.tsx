import { Radio } from 'antd'
import { IMongoCollection, ISelectMongo } from '../../types/Mongodb'

export interface ShowMongoCollectionProps {
    databaseName: string
    currentValue: ISelectMongo
    onChange: any
    collections: IMongoCollection[]
}

const ShowMongoCollection: React.SFC<ShowMongoCollectionProps> = ({
    currentValue,
    onChange,
    collections,
    databaseName,
}) => {
    const radioStyle = {
        display: 'block',
        height: '30px',
        lineHeight: '30px',
    }

    const onChangeRadio = (e) => {
        onChange({
            database: databaseName,
            collection: e.target.value,
        })
    }

    return (
        <Radio.Group
            onChange={onChangeRadio}
            value={currentValue ? currentValue.collection : ''}
        >
            {collections.length > 0 ? (
                collections.map((col) => (
                    <Radio style={radioStyle} key={col.name} value={col.name}>
                        {col.name}
                    </Radio>
                ))
            ) : (
                <p>no collection</p>
            )}
        </Radio.Group>
    )
}

export default ShowMongoCollection
