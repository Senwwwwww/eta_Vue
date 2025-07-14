<template>
  <div class="qr-generator-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span style="font-size: 18px; font-weight: bold">二维码生成器</span>
      </div>

      <el-form :model="form" label-width="100px" @submit.native.prevent="generateQRCode">
        <el-form-item label="设备ID">
          <el-input
              v-model="form.id"
              placeholder="请输入设备ID"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="generateQRCode">生成二维码</el-button>
        </el-form-item>
      </el-form>

      <div v-if="qrCodeBase64" class="qr-result">
        <div class="qr-card">
          <h4 class="qr-title">生成结果</h4>
          <img :src="qrCodeBase64" alt="QR Code" class="qr-image" />
          <div class="qr-button-container">
            <el-button type="success" @click="downloadQRCode" class="qr-button">下载二维码</el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { instance } from "@/util/request";
import {url} from "@/api/email"

export default {
  name: 'QRCodeGeneratorPage',
  data() {
    return {
      form: {
        id: ''
      },
      qrCodeBase64: ''
    };
  },
  methods: {
    async generateQRCode() {
      if (!this.form.id.trim()) {
        this.$message.warning('请输入设备ID');
        return;
      }

      try {
        this.$setToken();

        const url1 = url+`:8004/qrcode/${encodeURIComponent(this.form.id)}`;
        console.log(url1);
        const response = await instance.get(url1, {
          responseType: 'blob', // 👈 关键点：Axios 处理二进制流
        });

        if (response.status === 200) {
          const blob = response.data; // 👈 Axios 的 blob 数据是 response.data
          const reader = new FileReader();
          reader.onload = () => {
            this.qrCodeBase64 = reader.result;
            this.$message.success('二维码生成成功');
          };
          reader.readAsDataURL(blob);
        } else {
          this.$message.error('二维码生成失败，请检查设备ID');
        }
      } catch (err) {
        console.error(err);
        this.$message.error('生成二维码失败，请检查网络或服务器状态');
      }
    },
    downloadQRCode() {
      const link = document.createElement('a');
      link.href = this.qrCodeBase64;
      link.download = 'qrcode.png';
      link.click();
    }
  }
};
</script>

<style scoped>
.qr-generator-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
}

.qr-result {
  text-align: center;
  margin-top: 30px;
}

.qr-result {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.qr-button-container {
  text-align: center;
  margin-top: 10px;
  width: 100%;
}

.qr-card {
  text-align: center;
  padding: 20px 30px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #fafafa;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.qr-title {
  font-size: 18px;
  margin-bottom: 15px;
  color: #333;
}

.qr-image {
  max-width: 300px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.qr-button {
  margin-top: 15px;
}

</style>
