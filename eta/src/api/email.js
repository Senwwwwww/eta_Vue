// src/api/email.js
import axios from 'axios';

export const url = "http://10.100.164.82:5678";

export function sendEmailVerification(email,username) {
    return axios.post(url+'/api/send-verification-code', { email,username });
}
export function sendEmailVerification1(email) {
    return axios.post(url+'/api/send-verification-code', { email });
}
export function verifyCode(email, code) {
    return axios.post(url+'/api/verify-code', { email, code });
}
export function notifyStatusChange(email, username, status,type,time,what) {
    return axios.post(url+'/api/notify-status-change', { email, username, status,type,time,what});
}
