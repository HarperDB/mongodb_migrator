import { Collapse } from 'antd'
import ShowHarperTable from '../ShowHarperTable/ShowHarperTable'
import { IHarperSchema, ISelectHarper } from '../../types/Harperdb'

const { Panel } = Collapse

export interface ShowHarperSchemaProps {
    harperSchemas: IHarperSchema[]
    onSelected: any
    currentValue: ISelectHarper
}

const ShowHarperSchema: React.SFC<ShowHarperSchemaProps> = ({
    harperSchemas = [],
    onSelected,
    currentValue,
}) => {
    const onChange = (val: ISelectHarper) => {
        onSelected(val)
    }

    return (
        <div>
            <Collapse accordion>
                {harperSchemas.map((harper) => {
                    return (
                        <Panel
                            key={harper.schemaName}
                            header={harper.schemaName}
                        >
                            <ShowHarperTable
                                schemaName={harper.schemaName}
                                currentValue={currentValue}
                                onChange={onChange}
                                tables={harper.tables}
                            />
                        </Panel>
                    )
                })}
            </Collapse>
        </div>
    )
}

export default ShowHarperSchema
