import axios from 'axios';

// Mocking axios for testing purposes
export function getUserInfo() {
    return new Promise((resolve, reject) => {
            // Simulate successful API response
            resolve({
                data: {
                    userID: "123456789",
                    ygID: "987654321",
                    bumeng: "技术部",
                    name: "张三",
                    sex: "男",
                    email: "zhangsan@example.com",
                    birthday: "1990-01-01"
                }
            });
    });
}
