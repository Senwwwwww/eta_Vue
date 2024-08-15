const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
app.use(cors({
    origin: '*',  // 或者替换为指定的来源 URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(bodyParser.json());

// 配置邮件传输服务
const transporter = nodemailer.createTransport({
    host: 'smtp.163.com', // 163 邮箱的 SMTP 服务器
    port: 465,            // SMTP 端口
    secure: true,         // 使用 SSL
    auth: {
        user: 'a2427814198@163.com',  // 你的 163 邮箱地址
        pass: 'PBOJNACZUBKDAJHK'  // 你的 163 邮箱授权码，而不是邮箱密码
    }
});

// 存储验证码的临时数据结构
const verificationCodes = {};

// 发送验证码的API端点
app.post('/api/send-verification-code', (req, res) => {
    const email = req.body.email;
    const verificationCode = Math.floor(100000 + Math.random() * 900000); // 生成6位验证码

    // 存储验证码
    verificationCodes[email] = verificationCode;

    // 发送验证码邮件
    const mailOptions = {
        from: 'a2427814198@163.com',
        to: email,
        subject: '您的验证码',
        text: `您的验证码是 ${verificationCode}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ success: false, message: '发送邮件失败' });
        }
        res.json({ success: true, message: '验证码已发送' });
    });
});

// 验证验证码的API端点
app.post('/api/verify-code', (req, res) => {
    const { email, code } = req.body;
    if (verificationCodes[email] && verificationCodes[email] == code) {
        res.json({ success: true, message: '验证码验证成功' });
    } else {
        res.status(400).json({ success: false, message: '验证码错误' });
    }
});

// 处理根路径的 GET 请求
app.get('/', (req, res) => {
    res.send('服务器正在运行');
});

const port = 5678;
app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
});
