export const getItem = (key: string) => {
    return localStorage.getItem(key)
}

export const setItem = (key: string, val: string) => {
    localStorage.setItem(key, val)
}

export const removeItem = (key: string) => {
    localStorage.removeItem(key)
}

export const clearItem = () => {
    localStorage.clear()
}
