<template>
  <div class="mod-oss">
    <el-form :inline="true" :model="dataForm">
      <el-form-item>
        <el-button type="primary" @click="uploadHandle()">上传文件</el-button>
        <el-button type="primary" @click="downloadHandle()"
          :disabled="dataListSelections.length <= 0"
        >批量下载</el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="dataList"
      border
      v-loading="dataListLoading"
      @selection-change="selectionChangeHandle"
      style="width: 100%;"
    >
      <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
      <el-table-column prop="name" header-align="center" align="center" label="附件名称"></el-table-column>
      <el-table-column prop="code" header-align="center" align="center" label="附件代码"></el-table-column>
      <el-table-column prop="createTime" header-align="center" align="center" width="180" label="创建时间" ></el-table-column>
      <el-table-column prop="enable" header-align="center" align="center" width="150" label="状态">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.enable" size="small">启用</el-tag>
          <el-tag v-else size="small"  type="danger" >禁用</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="storageType.message" header-align="center" align="center" width="150" label="存储方式"></el-table-column>
      <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
        <template slot-scope="scope">
          <el-button v-if="endWith(scope.row.name, 'jpg') || endWith(scope.row.name, 'jpeg') || endWith(scope.row.name, 'png') " type="text" size="small" @click="viewHandle(scope.row.code)">查看</el-button>
          <el-button type="text" size="small" @click="downloadHandle(scope.row.code)">下载</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="sizeChangeHandle"
      @current-change="currentChangeHandle"
      :current-page="pageIndex"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      :total="totalPage"
      layout="total, sizes, prev, pager, next, jumper"
    ></el-pagination>
    <!-- 弹窗, 云存储配置 -->
    <el-dialog title="查看图片"
      :close-on-click-modal="false" width="800px" height="500px"
      @close="viewCloseHandle"
      :visible.sync="viewVisible">
      <img v-if="imageUrl" :src="imageUrl"  width="750px" height="450px">
    </el-dialog>
    <!-- 弹窗, 上传文件 -->
    <upload v-if="uploadVisible" ref="upload" @refreshDataList="getDataList"></upload>
  </div>
</template>

<script>
import Upload from "./oss-upload";
export default {
  data() {
    return {
      dataForm: {},
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      viewVisible: false,
      uploadVisible: false,
      imageUrl:''
    };
  },
  components: {
    Upload
  },
  activated() {
    this.getDataList();
  },
  methods: {
    // 获取数据列表
    getDataList() {
      this.dataListLoading = true;
      this.$http({
        url: this.$http.adornUrl("/attachment/findByPage.json"),
        method: "get",
        params: this.$http.adornParams({
          page: this.pageIndex - 1,
          size: this.pageSize
        })
      }).then(({ data }) => {
        if (data && data.success === true) {
          var respData = data.data;
          this.dataList = respData.content;
          this.totalPage = respData.totalElements;
        } else {
          this.dataList = [];
          this.totalPage = 0;
        }
        this.dataListLoading = false;
      });
    },
    // 每页数
    sizeChangeHandle(val) {
      this.pageSize = val;
      this.pageIndex = 1;
      this.getDataList();
    },
    // 当前页
    currentChangeHandle(val) {
      this.pageIndex = val;
      this.getDataList();
    },
    // 多选
    selectionChangeHandle(val) {
      this.dataListSelections = val;
    },
    // 上传文件
    uploadHandle() {
      this.uploadVisible = true;
      this.$nextTick(() => {
        this.$refs.upload.init();
      });
    },
    // 查看
    viewHandle(code) {
      this.$http({
        url: this.$http.adornUrl("/attachment/download.json"),
        method: "post",
        params:{
          fileCode : code
        },
        responseType: 'arraybuffer' // 响应类型
      }).then(({data}) => {
        // 显示查看图片
        const blob = new Blob([data])
        this.imageUrl = URL.createObjectURL(blob)
        this.viewVisible=true
      });
    },
    viewCloseHandle() {
      this.viewVisible = false
    },
    // 下载
    downloadHandle(code) {
      var codes = code
        ? [code]
        : this.dataListSelections.map(item => {
            return item.code;
          });
      this.$confirm(
        `确定进行[${code ? "下载" : "批量下载"}]操作?`,
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      )
        .then(() => {
          this.$http({
            url: this.$http.adornUrl("/attachment/download.json"),
            method: "post",
            params:{
              fileCode : codes.join(',')
            },
            responseType: 'arraybuffer' // 响应类型
          }).then((resp) => {
            this.$http.downloadHandle(resp); // 下载处理
          });
        })
        .catch(() => {});
    }
  }
};
</script>