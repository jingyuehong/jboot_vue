export default {
  namespaced: true,
  state: {
    id: 0,
    name: '',
    loginName: '',
    portraitCode: '',
  },
  mutations: {
    updateId (state, id) {
      state.id = id
    },
    updateName (state, name) {
      state.name = name
    },
    updateLoginName (state, loginName) {
      state.loginName = loginName
    },
    updatePortraitCode (state, portraitCode) {
      state.portraitCode = portraitCode
    }
  }
}
