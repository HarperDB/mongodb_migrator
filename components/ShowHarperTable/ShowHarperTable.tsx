import { Radio } from 'antd'
import { IHarperTable, ISelectHarper } from '../../types/Harperdb'

export interface ShowHarperTableProps {
    schemaName: string
    currentValue: ISelectHarper
    onChange: any
    tables: IHarperTable[]
}

const ShowHarperTable: React.SFC<ShowHarperTableProps> = ({
    currentValue,
    onChange,
    tables,
    schemaName,
}) => {
    const radioStyle = {
        display: 'block',
        height: '30px',
        lineHeight: '30px',
    }

    const onChangeRadio = (e) => {
        onChange({
            schemaName,
            tableName: e.target.value,
        })
    }

    return (
        <Radio.Group
            onChange={onChangeRadio}
            value={currentValue ? currentValue.tableName : ''}
        >
            {tables.length > 0 ? (
                tables.map((ta) => (
                    <Radio style={radioStyle} value={ta.name} key={ta.name}>
                        {ta.name}
                    </Radio>
                ))
            ) : (
                <p>no table</p>
            )}
        </Radio.Group>
    )
}

export default ShowHarperTable
