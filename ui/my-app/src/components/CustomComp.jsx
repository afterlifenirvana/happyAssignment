
import { Position, Handle} from '@xyflow/react';
import CustomHandle from './CustomHandle';



export function Employee(props) {
    // const onChange = useCallback((evt) => {
    //     console.log(evt.target.value)
    // }, [])
    return (
        <div className="employee-node" style={{ background: "gray", 
            padding: "2px", 
            border: "1px solid gray", 
            borderRadius: "5px", 
            zIndex: 10, 
            fontSize: 12, 
            visibility : props.data.hidden ? "hidden" : "visible", 
            minWidth: "120px",
            maxHeight: "50px"
        }}>
            <div style={{ color: "white", fontSize: "12px" }}>{props.data.label}</div>
            <div>{props.data.designation}</div>
            <Handle type="source" position={Position.Bottom} />
            <CustomHandle connectionCount={1} type="target" position={Position.Top} />
        </div>
    )
}

const nodeTypes = {
    employee: Employee,
}

export default {
    nodeTypes: nodeTypes
};
