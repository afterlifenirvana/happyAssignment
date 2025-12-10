import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Org from './components/Org'

import './App.css'

function App() {
    const [count, setCount] = useState(0)
    const queryClient = new QueryClient()

    return (
        <>
        <div>
            <QueryClientProvider client={queryClient}>
                <div style={{ width: "100vw", height: "100vh" }}>
                    <Org></Org>         
                </div>
            </QueryClientProvider>
        </div>
        </>
    )
}

export default App
