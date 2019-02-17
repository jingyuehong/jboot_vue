<template>
  <div class="mod-user">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <el-input v-model="dataForm.userName" placeholder="用户名" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <!-- el-button 中添加 v-if="isAuth('sys:user:save')" 实现按钮权限 -->
        <el-button type="primary" @click="addOrUpdateHandle()">新增</el-button>
        <!-- <el-button
          v-if="isAuth('sys:user:delete')"
          type="danger"
          @click="deleteHandle()"
          :disabled="dataListSelections.length <= 0"
        >批量删除</el-button> -->
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
      <el-table-column prop="userName" header-align="center" align="center" label="登录名"></el-table-column>
      <el-table-column prop="displayName" header-align="center" align="center" label="用户名"></el-table-column>
      <el-table-column prop="status" header-align="center" align="center" label="状态">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.enable === false" size="small" type="danger">禁用</el-tag>
          <el-tag v-else size="small">启用</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" header-align="center" align="center" width="180" label="创建时间" :formatter="formatDateTime" ></el-table-column>
      <el-table-column fixed="right" header-align="center" align="center" width="200" label="操作">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="small"
            @click="addOrUpdateHandle(scope.row.id)"
          >修改</el-button>
          <el-button
            v-if="scope.row.enable === true"
            type="text"
            size="small"
            @click="disableHandle(scope.row.id)"
          >禁用</el-button>
          <el-button
            v-if="scope.row.enable === false"
            type="text"
            size="small"
            @click="enableHandle(scope.row.id)"
          >启用</el-button>
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
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
  </div>
</template>

<script>
import AddOrUpdate from "./user-add-or-update";
export default {
  data() {
    return {
      dataForm: {
        userName: ""
      },
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false
    };
  },
  components: {
    AddOrUpdate
  },
  activated() {
    this.getDataList();
  },
  methods: {
    formatDateTime(row, column) {
      // 后台返回的类型为 yyyy-MM-dd hh:mm:ss
      return row.createTime
    },
    // 获取数据列表
    getDataList() {
      this.dataListLoading = true;
      this.$http({
        url: this.$http.adornUrl("/sys/user/findByPage.json"),
        method: "get",
        params: this.$http.adornParams({
          page: this.pageIndex - 1,
          size: this.pageSize,
          EQ_userName: this.dataForm.userName,
          NEQ_id:this.$store.state.user.id
        })
      }).then(({ data }) => {
        if (data && data.success === true) {
          var respData = data.data
          this.dataList = respData.content;
          this.totalPage = respData.totalElements;
        } else {
          this.$message.error(data.message);
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
    // 新增 / 修改
    addOrUpdateHandle(id) {
      this.addOrUpdateVisible = true;
      this.$nextTick(() => {
        this.$refs.addOrUpdate.init(id);
      });
    },
    // 启用
    enableHandle(id) {
      this.$http({
          url: this.$http.adornUrl("/sys/user/enable.json"),
          method: "post",
          data: this.$http.adornData(id, false)
        }).then(({ data }) => {
          if (data && data.success === true) {
            this.$message({
              message: "操作成功",
              type: "success",
              duration: 1000,
              onClose: () => {
                this.getDataList();
              }
            });
          } else {
            this.$message.error(data.message);
          }
        });
    },
    // 禁用
    disableHandle(id) {
      this.$http({
          url: this.$http.adornUrl("/sys/user/disable.json"),
          method: "post",
          data: this.$http.adornData(id, false)
        }).then(({ data }) => {
          if (data && data.success === true) {
            this.$message({
              message: "操作成功",
              type: "success",
              duration: 1000,
              onClose: () => {
                this.getDataList();
              }
            });
          } else {
            this.$message.error(data.message);
          }
        });
    },
    // 删除
    // deleteHandle(id) {
    //   var userIds = id ? [id] : this.dataListSelections.map(item => {
    //         return item.userId;
    //       });
    //   this.$confirm(
    //     `确定对[id=${userIds.join(",")}]进行[${id ? "删除" : "批量删除"}]操作?`,
    //     "提示",
    //     {
    //       confirmButtonText: "确定",
    //       cancelButtonText: "取消",
    //       type: "warning"
    //     }
    //   )
    //     .then(() => {
    //       this.$http({
    //         url: this.$http.adornUrl("/sys/user/delete"),
    //         method: "post",
    //         data: this.$http.adornData(userIds, false)
    //       }).then(({ data }) => {
    //         if (data && data.success === true) {
    //           this.$message({
    //             message: "操作成功",
    //             type: "success",
    //             duration: 1500,
    //             onClose: () => {
    //               this.getDataList();
    //             }
    //           });
    //         } else {
    //           this.$message.error(data.message);
    //         }
    //       });
    //     })
    //     .catch(() => {});
    // }
  }
};
</script>
