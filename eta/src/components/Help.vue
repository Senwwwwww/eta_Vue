<template>
  <div class="help-page">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>帮助中心</span>
        <el-input
            v-model="searchQuery"
            placeholder="请输入关键词搜索"
            prefix-icon="el-icon-search"
            class="search-input"
        ></el-input>
      </div>
      <el-collapse v-model="activeNames">
        <el-collapse-item
            v-for="(faq, index) in filteredFAQs"
            :key="index"
            :title="faq.question"
            :name="index"
        >
          <p>{{ faq.answer }}</p>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchQuery: '',
      activeNames: [],
      faqs: [
        {
          question: '如何重置密码？',
          answer: '您可以在个人中心的“修改密码”页面重置您的密码。',
        },
        {
          question: '如何查看考勤记录？',
          answer: '您可以在“考勤记录”页面选择对应的月份查看您的考勤情况。',
        },
        {
          question: '如何申请休假？',
          answer: '您可以在“我要申请”页面提交您的休假申请。',
        },
        {
          question: '如何反馈问题？',
          answer: '您可以在“意见反馈”页面提交您的问题或建议。',
        },
      ],
    };
  },
  computed: {
    filteredFAQs() {
      const query = this.searchQuery.toLowerCase();
      return this.faqs.filter(faq =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query)
      );
    },
  },
};
</script>

<style scoped>
.help-page {
  padding: 20px;
}

.box-card {
  padding: 20px;
}

.search-input {
  width: 300px;
  float: right;
}

.el-collapse-item__header {
  font-weight: bold;
}
</style>
