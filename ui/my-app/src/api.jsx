// use axios to create instance for backend request
import axios from 'axios'

console.log(import.meta.env)

export const http = axios.create({
    baseURL: import.meta.env.VITE_API_URL
})

const getOrg = async () => {
    var fetchUrl = '/get-org'
    const response = await http.get(fetchUrl)
    return response
}

const updateManager = async (id, managerId) => {
    const response = await http.post(`/employee/${id}`, {manager_id: managerId})
    return response
}
const Api = {
    getOrg,
    updateManager
}
export default Api