// src/api/email.js
import axios from 'axios';

export function sendEmailVerification(email) {
    return axios.post('http://localhost:5678/api/send-verification-code', { email });
}

export function verifyCode(email, code) {
    return axios.post('http://localhost:5678/api/verify-code', { email, code });
}
