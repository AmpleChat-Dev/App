import { writable } from 'svelte/store'
export const authenticated = writable(getAuthenticatedState())
authenticated.subscribe(nval => localStorage.setItem("P98xVtnzyu", nval))

function getAuthenticatedState() {
    if (localStorage.getItem("P98xVtnzyu") == null) {
        localStorage.setItem("P98xVtnzyu", false)
        return false
    } else {
        let state = localStorage.getItem("P98xVtnzyu")
        return state == 'true'
    }
}