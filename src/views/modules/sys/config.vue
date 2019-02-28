<template>
  <div class="mod-config">
    <el-container>
      <el-aside width="200px">
        <el-input placeholder="输入关键字进行过滤" v-model="filterText"> </el-input>
        <el-tree class="filter-tree" :props="defaultProps" :data="treeData" node-key="id"
         :default-expand-all="false" :filter-node-method="filterNode" ref="tree"
         @node-click="treeNodeClick" :default-expanded-keys="expandedKeys" :highlight-current="true" :accordion="true">
        </el-tree>
      </el-aside>
      <el-main>
        <el-form v-if="isStart"  ref="dataForm" :model="dataForm" label-width="80px">
          <el-form-item :label="isGroup ? '分组名' : '参数名'" prop="name">
            <el-input  placeholder="参数名" v-model="dataForm.name" ></el-input>
          </el-form-item>
          <el-form-item :label="isGroup ? '分组代码':'参数代码'" prop="code">
            <el-input :placeholder="isGroup?'分组代码':'参数代码由后台自动生成'" v-model="dataForm.code" :disabled="true" :readonly="true"></el-input>
          </el-form-item>
          <el-form-item  label="排序号" prop="orderNum">
            <el-input-number v-model="dataForm.orderNum" controls-position="right" :min="0" label="排序号"></el-input-number>
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input  placeholder="备注" v-model="dataForm.remark" ></el-input>
          </el-form-item>
          <el-form-item v-if="!isGroup" label="父节点" prop="parentName">
            <el-popover ref="parentCodePopover" placement="bottom-start" trigger="click">
              <el-tree  :data="codeList" :props="defaultProps" node-key="id" ref="parentCodeTree" 
                @current-change="parentCodeChangeHandle"
                :default-expand-all="true"
                :highlight-current="true"
                :expand-on-click-node="false">
              </el-tree>
            </el-popover>
            <el-input v-model="dataForm.parentName" v-popover:parentCodePopover :readonly="true" placeholder="点击选择父节点" class="menu-list__input" clearable></el-input>
          </el-form-item>
          <el-form-item v-if="!isGroup" label="状态" prop="enable">
              <el-radio-group v-model="dataForm.enable">
                <el-radio :label="true">启用</el-radio>
                <el-radio :label="false">停用</el-radio>
              </el-radio-group>
          </el-form-item>
          <div style="float:right;">
            <el-button type="primary" v-if="isGroup" @click="addNewCode">新增参数</el-button>
            <el-button type="primary" @click="saveOrUpdateData">保存</el-button>
          </div>
        </el-form>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { treeDataTranslate } from '@/utils'
import { join } from 'path';
export default {
  data() {
    return {
      dataForm: {
        id: '',
        code: '',
        name: '',
        orderNum: 0,
        remark: '',
        parentId: null,
        parentName:'',
        groupId: 0,
        enable: true,
        groupTreeId:''
      },
      listTreeData:[],
      treeData:[],
      isGroup: true,
      isStart:false,
      filterText: '',
      codeList:[],
      expandedKeys:[],
      defaultProps: {
        label: 'name',
        children: 'children'
      },
      dataRule: {
          name: [
            { required: true, message: '参数名不能为空', trigger: 'blur' }
          ]
      }
    };
  },
  components: {
  },
  watch:{
    filterText(val) {
      this.$refs.tree.filter(val);
    }
  },
  activated() {
    this.loadGroupInfo()
  },
  methods: {
    // 节点过滤
    filterNode(value, data) {
      if (!value) return true;
        return data.name.indexOf(value) !== -1;
    },
    // 加载分组信息
    loadGroupInfo() {
      this.$http({
        url: this.$http.adornUrl("/sys/codevalue/groupList.json"),
        method: "get",
        params: this.$http.adornParams()
      }).then(({ data }) => {
        if (data && data.success === true) {
          var respData = data.data
          respData.forEach(ele=>{
            ele.id = ele.id +'_'+ele.code
          })
          this.copyProperty(respData, this.listTreeData)
          this.treeData = treeDataTranslate(this.listTreeData,"id")
        } else {
          this.$message.error(data.message);
        }
      });
    },
    copyProperty(source, target=[]) {
      if (source && source.length > 0) {
        source.forEach(ele=>{
          var exist = false
          target.forEach(te =>{
            if (ele.id === te.id) {
                // 相同元素
                exist = true
                for (var key in ele) {
                  te[key] = ele[key]
                }
            }
          })
          if (!exist) {
            target.push(ele)
          }
        })
      }
      return target;
    },
    // 树节点点击
    treeNodeClick(data, node, ele) {
      this.isStart = true
      this.dataForm.code = data.code
      this.dataForm.name = data.name
      this.dataForm.orderNum = data.orderNum
      this.dataForm.remark = data.remark
      var needHandlerChild = false
      if (node.level === 1) {
        // 分组点击
        this.isGroup = true  
        this.dataForm.id = data.id.split('_')[0]
        this.dataForm.groupId = data.id.split('_')[0]
        this.dataForm.groupTreeId = data.id
        // 加载子节点
        var children = data.children
        if (!children) {
          needHandlerChild = true
        }
         this.dataForm.parentId = null
         this.dataForm.enable = true
      } else {
        // 参数值点击
        this.isGroup = false
        this.dataForm.id = data.id
        var parentId = data.parentId
        if (isNaN(parentId)) {
          this.dataForm.parentId = null
        } else {
          this.dataForm.parentId = data.parentId
        }
        this.dataForm.groupId = data.groupId
        this.dataForm.enable = data.enable
      }  
      // 获得父节点选择树
      this.loadCodeInfo(needHandlerChild)
    },
    // 加载参数值信息
    loadCodeInfo(needHandlerChild,needHandleParentCheck=true) {
      if (this.dataForm.groupId) {
        this.$http({
          url: this.$http.adornUrl("/sys/codevalue/valueList.json"),
          method: "get",
          params: this.$http.adornParams({
            groupId : this.dataForm.groupId
          })
        }).then(({ data }) => {
          if (data && data.success === true) {
            var respData = JSON.stringify(data.data)
            if (needHandleParentCheck) {
              var codes = JSON.parse(respData)
              if (!this.isGroup && this.dataForm.id) {
                // 去掉自身
                codes = codes.filter(t => t.id != this.dataForm.id)
              }
              this.codeList = treeDataTranslate(codes, 'id')
              // 设置父节点选中
              if (this.dataForm.parentId) {
                this.$refs.parentCodeTree.setCurrentKey(this.dataForm.parentId)
                this.dataForm.parentName = (this.$refs.parentCodeTree.getCurrentNode() || {})['name']
              } else {
                this.dataForm.parentName=''
              }
            }
            var childrenData = JSON.parse(respData)
            if (needHandlerChild && childrenData && childrenData.length > 0) {
              // 修改父类Id
              childrenData.forEach(element => {
                if (!element.parentId) {
                  element.parentId = this.dataForm.groupTreeId
                }
              });
              this.copyProperty(childrenData, this.listTreeData)
              this.treeData = treeDataTranslate(this.listTreeData,"id")
              this.expandedKeys = [this.dataForm.groupTreeId]
            }
          } else {
            this.$message.error(data.message);
          }
        });
      }
    },
    // 新增按钮
    addNewCode() {
      this.isGroup=false
      this.dataForm.id=null
      this.dataForm.parentName=''
      this.dataForm.name=''
      this.dataForm.code=''
      this.dataForm.orderNum=0
      this.dataForm.remark=''
      this.dataForm.parentId=''
      this.dataForm.enable=true
    },
    // 父节点选择事件
    parentCodeChangeHandle(data, node) {
      this.dataForm.parentId = data.id
      this.dataForm.parentName = data.name
    },
    saveOrUpdateData() {
      this.$http({
        url: this.$http.adornUrl(`/sys/codevalue/${this.isGroup ? 'updateGroupInfo.json':'saveOrUpdateValue.json'}`),
        method:'post',
        data: this.$http.adornData({
          'id': this.dataForm.id || undefined,
          'code': this.dataForm.code,
          'name': this.dataForm.name,
          'orderNum': this.dataForm.orderNum,
          'remark': this.dataForm.remark,
          'parentId': this.dataForm.parentId || undefined,
          'groupId': this.dataForm.groupId,
          'enable': this.dataForm.enable,
        })
      }).then(({data})=>{
        if (data && data.success === true) {
          this.$message({
            message: '操作成功',
            type: 'success',
            duration: 1000,
            onClose: () => {
              if (this.isGroup) {
                this.loadGroupInfo()
              } else {
                this.loadCodeInfo(true,false)
              }
              this.expandedKeys=[this.dataForm.groupTreeId]
              this.isGroup = true
              this.isStart=false
            }
          })
        } else {
          this.$message.error(data.message)
        }
      }).catch(() => {});
    }
  }
};
</script>
