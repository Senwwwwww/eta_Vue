<template>
  <el-dialog
      title="设置用户名"
      :visible.sync="visible"
      width="30%"
      :before-close="handleClose"
  >
    <el-form :model="form">
      <el-form-item label="用户名" :label-width="formLabelWidth">
        <el-input v-model="form.username"></el-input>
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
        username: ""
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
      if (this.form.username.trim() === "") {
        this.$message.error("用户名不能为空");
        return;
      }
      instance.put("/user/username", this.username).then(
          response => {
            if(response.data.success) {
              this.$emit("username-set", this.form.username);
              this.$message.success("设置成功");
              this.handleClose();
            }else{
              this.$message.error(response.data.errorMsg);
            }
          }
      ).catch(error => {
        this.$message.error("设置失败");
      });

      // instance.put()
    }
  }
};
</script>
