<template>
  <div class="mod-demo-ueditor">
    <el-alert
      title="提示："
      type="warning"
      :closable="false">
      <div slot-scope="description">
        <p class="el-alert__description">1. 此Demo只提供UEditor官方使用文档，入门部署和体验功能。具体使用请参考：http://fex.baidu.com/ueditor/</p>
        <p class="el-alert__description">2. 浏览器控制台报错“请求后台配置项http错误，上传功能将不能正常使用！”，此错需要后台提供上传接口方法（赋值给serverUrl属性）</p>
      </div>
    </el-alert>

    <!-- <script :id="ueId" class="ueditor-box" type="text/plain" style="width: 100%; height: 260px;">45676454576</script> -->
    <ue  id="editor" ref="editor" style="width:50%" value="3456d"></ue>
    
    <!-- 获取内容 -->
    <p><el-button @click="getContent()">获得内容</el-button></p>
    <el-dialog
      title="内容"
      :visible.sync="dialogVisible"
      :append-to-body="true">
      <div v-html="ueContent"></div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import ue from '@/components/ueditor';
  // import ueditor from 'ueditor'
  export default {
    data () {
      return {
        // ue: null,
        // ueId: `J_ueditorBox_${new Date().getTime()}`,
        ueContent: '',
        dialogVisible: false
      }
    },
    components: {
      ue
    },
    methods: {
      getContent () {
        this.dialogVisible = true
        this.ueContent = this.$refs.editor.getContent()
      }
    }
  }
</script>

<style lang="scss">
  .mod-demo-ueditor {
    position: relative;
    z-index: 510;
    > .el-alert {
      margin-bottom: 10px;
    }
  }
</style>
