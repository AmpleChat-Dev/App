import { writable } from 'svelte/store'

export const authenticated = writable(getAuthenticatedState())

authenticated.subscribe(nval => {

    if (nval == undefined)
        nval = false;

    sessionStorage.setItem("authenticated", nval)
})

function getAuthenticatedState() {
    let state = sessionStorage.getItem("authenticated")

    if (!state)
        return false

    if (state == 'true')
        return true
}

export function saveItem(key, value) {
    sessionStorage.setItem(key, value)
}

export function getItem(key) {
    return sessionStorage.getItem(key)
}

export function removeKey(key) {
    sessionStorage.removeItem(key)
}