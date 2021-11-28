export const NULL = 0
export const ERROR = 1
export const INFO_PACKET = 2
export const REGISTER_PACKET = 3
export const REGISTER_RESPONSE = 4
export const LOGIN_PACKET = 5
export const LOGIN_RESPONSE = 6
export const ACCOUNT_INFO_PACKET = 7
export const ACCOUNT_INFO_RESPONSE = 8

function parsePacket(rawData) {
    return JSON.parse(rawData)
}