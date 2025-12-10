import { memo } from "react";
import { useNodeConnections, Handle } from "@xyflow/react";

const CustomHandle = ({connectionCount, ...props}) => {
  const connections = useNodeConnections({
    handleType: props.type,
  });
 
  return (
    <Handle
      {...props}
      isConnectable={connections.length < connectionCount}
    />
  );
};

export default memo(CustomHandle)