<template>
  <el-dialog
      title="设置用户名"
      :visible.sync="visible"
      width="30%"
      :before-close="handleClose"
  >
    <el-form :model="form">
      <el-form-item label="用户名" :label-width="formLabelWidth">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {instance} from "@/util/request";

export default {
  name: "SetUsernameDialog",
  data() {
    return {
      visible: false,
      form: {
        name: ""
      },
      formLabelWidth: "100px"
    };
  },
  methods: {
    open() {
      this.visible = true;
    },
    handleClose() {
      this.visible = false;
    },
    handleConfirm() {
      if (this.form.name.trim() === "") {
        this.$message.error("用户名不能为空");
        return;
      }
      if (this.form.name.length >= 10) {
        this.$message.error("用户名长度必须小于 10 个字符");
        return;
      }
      this.$setToken()
      instance.put("/user/login/setName/"+this.$store.state.admin.admin.data.data.userId+'?'+'userId='+this.form.userId+'&&'+'name='+this.form.name,this.form).then(
          response => {
            if(response.data.success) {
              this.$emit("username-set", this.form.username);
              this.$message.success("设置成功");
              this.handleClose();
              this.$store.commit("setAdmin", response)
            }else{
              this.$message.error(response.data.errorMsg);
            }
          }
      )
          .catch(error=>{
            this.$message.error("请求失败");
          })
    }
  }
};
</script>
