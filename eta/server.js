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
    },
    debug: true,  // 启用调试模式
    logger: true  // 输出更多日志信息
});

// 存储验证码的临时数据结构
const verificationCodes = {};

// 发送验证码的API端点
app.post('/api/send-verification-code', (req, res) => {
    console.log(req)
    const email = req.body.email;
    const verificationCode = Math.floor(100000 + Math.random() * 900000); // 生成6位验证码
    const username =req.body.username;

    // 存储验证码
    verificationCodes[email] = verificationCode;

    // 发送验证码邮件
    const mailOptions = {
        from: '"简用" <a2427814198@163.com>', // 发件人名称和邮箱
        to: email, // 收件人邮箱
        subject: '您的简用验证码', // 邮件主题
        text: `尊敬的 ${username}, 您好！

感谢您使用简用。您的验证码是：${verificationCode}

请在10分钟内输入验证码完成验证。如果您没有请求此验证码，请忽略此邮件。

感谢您的支持！

简用团队`, // 邮件正文
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            //打印错误信息
            console.log(error);
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
app.listen(port, '0.0.0.0',() => {
    console.log(`服务器运行在  47.108.174.171:${port}`);
});


app.post('/api/notify-status-change', (req, res) => {
    const { email, username, status ,type,time,what} = req.body;

    const mailOptions = {
        from: '"简用" <a2427814198@163.com>', // 发件人名称和邮箱
        to: email, // 收件人邮箱
        subject: `您的简用${what}状态更新`, // 邮件主题
        text: `尊敬的 ${username}, 您好！

感谢您于${time}提交的关于${type}的申请。

您的${what}状态已更新为：${status}。

如果您有任何疑问，请与我们联系。

感谢您的支持！

简用团队`, // 邮件正文
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: '发送邮件失败' });
        }
        res.json({ success: true, message: '状态更新通知已发送' });
    });
});
