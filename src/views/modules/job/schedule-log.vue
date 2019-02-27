<template>
  <el-dialog title="日志列表" :close-on-click-modal="false" :visible.sync="visible" width="75%">
    <!-- <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <el-input v-model="dataForm.id" placeholder="任务ID" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
      </el-form-item>
    </el-form>-->
    <el-table :data="dataList" border v-loading="dataListLoading" style="width: 100%;">
      <el-table-column type="index" width="50"> </el-table-column>
      <el-table-column prop="title" header-align="center" align="center" width="150" label="任务标题"></el-table-column>
      <el-table-column prop="startTime" header-align="center" align="center" width="160" label="执行开始时间"></el-table-column>
      <el-table-column prop="finishTime" header-align="center" align="center" width="160" label="执行结束时间"></el-table-column>
      <el-table-column prop="success" header-align="center" align="center" width="100" label="结果">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.success" size="small">成功</el-tag>
          <el-tag v-else size="small" type="danger" style="cursor: pointer;" >失败</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="resultMsg" header-align="center" align="left" label="结果说明"></el-table-column>
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
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      dataForm: {
        id: ""
      },
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false
    };
  },
  methods: {
    init(id) {
      this.visible = true;
      this.dataForm.id = id;
      this.getDataList();
    },
    // 获取数据列表
    getDataList() {
      this.dataListLoading = true;
      this.$http({
        url: this.$http.adornUrl("/quartzExecutionLog/executionLog.json"),
        method: "get",
        params: this.$http.adornParams({
          page: this.pageIndex - 1,
          size: this.pageSize,
          EQ_taskId: this.dataForm.id,
          sort : 'finishTime,desc'
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
    }
  }
};
</script>
