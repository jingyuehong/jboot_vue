<template>
  <div
    class="site-wrapper"
    :class="{ 'site-sidebar--fold': sidebarFold }"
    v-loading.fullscreen.lock="loading"
    element-loading-text="拼命加载中">
    <template v-if="!loading">
      <main-navbar />
      <main-sidebar />
      <div class="site-content__wrapper" :style="{ 'min-height': documentClientHeight + 'px' }">
        <main-content />
      </div>
    </template>
  </div>
</template>

<script>
  import MainNavbar from './main-navbar'
  import MainSidebar from './main-sidebar'
  import MainContent from './main-content'
  import router from '@/router'
  import {fnAddDynamicMenuRoutes} from '@/router'
  export default {
    data () {
      return {
        loading: true
      }
    },
    components: {
      MainNavbar,
      MainSidebar,
      MainContent
    },
    computed: {
      documentClientHeight: {
        get () { return this.$store.state.common.documentClientHeight },
        set (val) { this.$store.commit('common/updateDocumentClientHeight', val) }
      },
      sidebarFold: {
        get () { return this.$store.state.common.sidebarFold }
      },
      userId: {
        get () { return this.$store.state.user.id },
        set (val) { this.$store.commit('user/updateId', val) }
      },
      userName: {
        get () { return this.$store.state.user.name },
        set (val) { this.$store.commit('user/updateName', val) }
      },
      loginName : {
        get () {return this.$store.state.user.loginName},
        set (val) {this.$store.commit('user/updateLoginName', val)}
      },
      portraitCode : {
        get () {return this.$store.user.portraitCode},
        set (val) {this.$store.commit('user/updatePortraitCode', val)}
      }
    },
    created () {
      this.getUserInfo()
    },
    mounted () {
      this.resetDocumentClientHeight()
    },
    methods: {
      // 重置窗口可视高度
      resetDocumentClientHeight () {
        this.documentClientHeight = document.documentElement['clientHeight']
        window.onresize = () => {
          this.documentClientHeight = document.documentElement['clientHeight']
        }
      },
      // 获取当前管理员信息
      getUserInfo () {
        this.$http({
          url: this.$http.adornUrl('/getLoginUserInfo.json'),
          method: 'post',
          params: this.$http.adornParams()
        }).then(({data}) => {
          if (data && data.success === true) {
            var user = data.data
            this.loading = false
            this.userId = user.userId
            this.userName = user.displayName
            this.portraitCode = user.portraitCode
            this.loginName = user.userName
            // 权限和菜单信息
            var menuList = user.menuSet
            var permissions = user.pemissionSet
            // 调用routes中的菜单构建方法
            fnAddDynamicMenuRoutes(menuList)
            router.options.isAddDynamicMenuRoutes = true
            sessionStorage.setItem('menuList', JSON.stringify(menuList || '[]'))
            sessionStorage.setItem('permissions', JSON.stringify(permissions || '[]'))
          } else {
            sessionStorage.setItem('menuList', '[]')
            sessionStorage.setItem('permissions', '[]')
          }
        }).catch((e) => {
          console.log(`获取用户信息失败，跳转至登录页！！`, 'color:blue')
          router.push({ name: 'login' })
        })
      }
    }
  }
</script>
