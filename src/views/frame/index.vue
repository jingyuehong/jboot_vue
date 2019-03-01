<template>
  <div>
    <el-container>
      <el-header class="el-header-class">
          <el-menu :default-active="activeIndex"
            class="el-menu-class"
            mode="horizontal"
            @select="handleSelect"
            background-color="#545c64"
            text-color="#fff"
            active-text-color="#ffd04b"
            router>
            <el-menu-item index="1" @click="$router.push({ name: 'index' })">首页</el-menu-item>
            <el-submenu index="2">
              <template slot="title">菜单2</template>
              <el-menu-item index="2-1" @click="$router.push({ name: 'index' })">选项1</el-menu-item>
              <el-menu-item index="2-2" @click="$router.push({ name: 'index' })">选项2</el-menu-item>
              <el-menu-item index="2-3" @click="$router.push({ name: 'index' })">选项3</el-menu-item>
              <el-submenu index="2-4">
                <template slot="title">选项4</template>
                <el-menu-item index="2-4-1" @click="$router.push({ name: 'index' })">选项1</el-menu-item>
                <el-menu-item index="2-4-2" @click="$router.push({ name: 'index' })">选项2</el-menu-item>
                <el-menu-item index="2-4-3" @click="$router.push({ name: 'index' })">选项3</el-menu-item>
              </el-submenu>
            </el-submenu>
            <el-menu-item index="3" @click="$router.push({ name: 'introduce' })">介绍</el-menu-item>
            <el-menu-item index="4" @click="$router.push({ name: 'aboutus' })">关于我们</el-menu-item>
            <el-menu-item index="5" v-if="!$cookie.get('token')"  @click="$router.push({ name: 'login' })">登录</el-menu-item>
            <el-menu-item index="6" v-if="!!$cookie.get('token')"  @click="$router.push({ name: 'main' })">我的工作台</el-menu-item>
          </el-menu>
      </el-header>
      <el-main class="el-main-class">
        <router-view></router-view>
      </el-main>
      <el-footer class="el-footer-class" height="30px">
        <div></div>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        activeIndex: '1'
      };
    },
    methods: {
      handleSelect(key, keyPath) {
        console.log(key, keyPath);
      }
    }
  }
</script>
<style>
  .el-header-class {
    background-color:#545c64;
    height:60px;
  }
  .el-menu-class {
    float: right;
  }
  .el-main-class {
    width: 100%;
  }
  .el-footer-class {
    background-color:#545c64;
    text-align: center;
    position:absolute;
    bottom: 0;
    width: 100%;
  }
</style>