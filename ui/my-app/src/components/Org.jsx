import React, { useState, useCallback } from "react"
import { useMutation, useQuery } from '@tanstack/react-query'
import {
    ReactFlow, applyNodeChanges,
    applyEdgeChanges, addEdge,
    Background, Position,
    useReactFlow, ReactFlowProvider,
    useStoreApi, getOutgoers
} from '@xyflow/react';

import Api from "../api"
import CustomComp from "./CustomComp";
import '@xyflow/react/dist/style.css';

const MIN_DISTANCE = 120;

function Org({mutation, ...props}) {
    const store = useStoreApi();

    const [nodes, setNodes] = useState(props.nodes);
    const [edges, setEdges] = useState(props.edges);
    const { getInternalNode, getEdges, getNodes } = useReactFlow();

    const getClosestEdge = useCallback((node) => {
        const { nodeLookup } = store.getState();
        const internalNode = getInternalNode(node.id);

        const closestNode = Array.from(nodeLookup.values()).reduce(
            (res, n) => {
                if (n.id !== internalNode.id) {
                    const dx =
                        n.internals.positionAbsolute.x -
                        internalNode.internals.positionAbsolute.x;
                    const dy =
                        n.internals.positionAbsolute.y -
                        internalNode.internals.positionAbsolute.y;
                    const d = Math.sqrt(dx * dx + dy * dy);

                    if (d < res.distance && d < MIN_DISTANCE) {
                        res.distance = d;
                        res.node = n;
                    }
                }

                return res;
            },
            {
                distance: Number.MAX_VALUE,
                node: null,
            },
        );

        if (!closestNode.node) {
            return null;
        }
        
        return {
            id: `${closestNode.node.id}-${node.id}`,
            source: closestNode.node.id,
            target: node.id,
        };
    }, [getInternalNode, store]);

    const onNodeDrag = useCallback(
        (_, node) => {
            const closeEdge = getClosestEdge(node);

            setEdges((es) => {
                const nextEdges = es.filter((e) => e.className !== 'temp');

                if (
                    closeEdge &&
                    !nextEdges.find(
                        (ne) =>
                            ne.source === closeEdge.source && ne.target === closeEdge.target,
                    )
                ) {
                    closeEdge.className = 'temp';
                    nextEdges.push(closeEdge);
                }

                return nextEdges;
            });
        },
        [getClosestEdge, setEdges],
    );
    const onNodeDragStop = useCallback(
        (_, node) => {
            const closeEdge = getClosestEdge(node);

            setEdges((es) => {
                const nextEdges = es.filter((e) => e.className !== 'temp');
                if (
                    closeEdge &&
                    !nextEdges.find(
                        (ne) =>
                            ne.source === closeEdge.source && ne.target === closeEdge.target,
                    )
                ) {
                    const filteredEdges = nextEdges.filter((e) => e.target !== closeEdge.target);
                    filteredEdges.push(closeEdge);
                    mutation.mutate({id: closeEdge.target, managerId: closeEdge.source})
                    return filteredEdges;
                }

                return nextEdges;
            });
        },
        [getClosestEdge, mutation],
    );

    const isValidConnection = useCallback(
        (connection) => {
        // we are using getNodes and getEdges helpers here
        // to make sure we create isValidConnection function only once
        const nodes = getNodes();
        const edges = getEdges();
        const target = nodes.find((node) => node.id === connection.target);
        const hasCycle = (node, visited = new Set()) => {
            if (visited.has(node.id)) return false;
    
            visited.add(node.id);
    
            for (const outgoer of getOutgoers(node, nodes, edges)) {
            if (outgoer.id === connection.source) return true;
            if (hasCycle(outgoer, visited)) return true;
            }
        };
    
        if (target.id === connection.source) return false;
        return !hasCycle(target);
        },
        [getNodes, getEdges],
    );
 
    const onNodesChange = useCallback(
        (changes) => setNodes((nodesSnapshot) => {
            return applyNodeChanges(changes, nodesSnapshot)
        }),
        [setNodes],
    );
    const onEdgesChange = useCallback(
        (changes) => setEdges((edgesSnapshot) => {
            // console.log(changes)
            return applyEdgeChanges(changes, edgesSnapshot)
        }),
        [setEdges],
    );
    const onConnect = useCallback(
        (params) => setEdges((edgesSnapshot) => {
            // console.log(params)
            return addEdge(params, edgesSnapshot)
        }),
        [setEdges],
    );
    // Queries
    return <>
        <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={CustomComp.nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDrag={onNodeDrag}
            onNodeDragStop={onNodeDragStop}
            isValidConnection={isValidConnection}
            // fitView
            colorMode="dark"
        >
            <Background></Background>
        </ReactFlow>
    </>
}

function OrgWithProvider() {
    const { data, isLoading: statsLoading, isSuccess } = useQuery({
        queryKey: ['remediation-stats'],
        queryFn: async () => {
            const response = await Api.getOrg()
            const { nodes, edges } = await buildGraphNodesAndEdges(response.data)
            return { nodes, edges }
        },
        refetchInterval: 300000,
    })

    const mutation = useMutation({
        mutationFn: async ({id, managerId}) => {
            return Api.updateManager(id, managerId)
        }
    })

    const nodeDefaults = {
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
        hidden: false,
        style: {
            visibility: "visible"
        }
    }

    const buildGraphNodesAndEdges = async (data) => {
        let employeeMap = {}
        const nodes = []
        const edges = []
        
        for (let x in data) {
            const node = {
                id: `${data[x].id}`,
                type: "employee",
                position: { x: 240, y: 240 },
                data: {
                    label: data[x].name,
                    ...data[x]
                },
                ...nodeDefaults
            }
            nodes.push(node)
            employeeMap[data[x].id] = node
        }
        
        for (let x in data) {
            if (data[x].manager_id !== null) {
                const manager = employeeMap[data[x].manager_id]
                if (manager) {
                    if ("children" in manager) {
                        manager.children += 1
                    } else {
                        manager.children = 1
                    }
                    employeeMap[data[x].id].position = {
                        y: manager.position.y + 140,
                        x: manager.position.x + 140 * manager.children
                    }
                    console.log(data[x].name, employeeMap[data[x].id].position.x, manager.position.x)
                }
                
                edges.push({
                    id: `${data[x].manager_id}-${data[x].id}`,
                    source: `${data[x]?.manager_id}`,
                    target: `${data[x]?.id}`,
                    hidden: false,
                    style: {
                        visibility: "visible"
                    }
                })
            }
        }
        return { nodes, edges }
    }
    return (
        <ReactFlowProvider>
            {isSuccess && (
                <Org nodes={data.nodes} edges={data.edges} mutation={mutation}/>
            )}
        </ReactFlowProvider>
    )
}

export default OrgWithProvider