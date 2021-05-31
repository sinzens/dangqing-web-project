export default {
  title: {
    app: '参数配置工具',
    navigator: '导航栏',
    notification: '提示',
    exportData: '导出数据',
    newDataItem: '新建数据',
    editDataItem: '修改数据',
    deleteDataItem: '删除数据',
    deleteBackup: '删除备份记录',
    backupPreview: '备份记录预览',
    backup: '备份记录',
    error: '错误'
  },
  header: {
    navigator: {
      basicModel: '基本模型参数配置',
      batchTable: '波次数据表配置',
      atdTable: '落客到安检数据表配置',
      dtaTable: '安检点到指定区域数据表配置'
    },
    searchRule: {
      smaller: '小于',
      equal: '等于',
      larger: '大于',
      smallerEqual: '小于等于',
      largerEqual: '大于等于'
    },
    captionMenu: {
      settings: '设置',
      toggleDevTools: '切换开发人员工具',
      reloadPage: '重新加载页面',
      about: '关于软件'
    },
    basicModel: {
      selectBatches: '波次选择',
      initialSpeed: '人员初始速度 (m/s)',
      preferredSpeed: '人员舒适速度 (m/s)',
      recordPointInterval: '记录点位时间间隔 (s)',
      writeCsvInterval: '写入csv时间间隔 (s)',
      numberOfPeople: '生成人数'
    },
    batchTable: {
      batchno: '波次编号',
      arrialtime: '到达时间 (min)',
      arrivalnum: '到达人数',
      dropoff_no: '落客点',
      stand_no: '看台区域号',
      security_no: '安检点',
      sc_capacity: '安检点最大人数'
    },
    atdTable: {
      area: '落客点',
      name: '详细说明',
      destination: '安检点',
      path: '路径'
    },
    dtaTable: {
      name: '路径名',
      content: '详细说明',
      security_no: '安检点',
      areanumber: '看台区域号',
      path: '路径'
    },
    backupTable: {
      identifier: '记录日期'
    },
    actions: '操作',
    settings: '设置',
    about: '关于'
  },
  text: {
    unknown: '未知字段',
    confirm: '确定',
    cancel: '取消',
    save: '保存',
    statusBar: {
      databaseHost: '数据库地址',
      databaseVersion: '数据库版本'
    },
    exportData: '导出数据',
    fileName: '文件名',
    extName: '后缀名',
    noData: '没有数据',
    noResult: '没有符合条件的结果',
    loading: '正在读取',
    newDataItem: '新建数据',
    deleteDataItem: '删除数据',
    deleteDataItemConfirm: '确定要删除此数据吗 (可以从备份中恢复)',
    deleteBackupConfirm: '确定要删除备份记录吗 (不可恢复)',
    editDataItem: '修改数据',
    configError: '配置解析失败',
    backupError: '备份文件解析失败',
    selectAll: '全部选择',
    invertSelect: '反向选择',
    deselectAll: '取消选择',
    emptyNotAllowed: '不能为空',
    negativeNotAllowed: '不能为负数',
    stringNotAllowed: '必须是数字',
    integerNotAllowed: '必须是小数',
    floatNotAllowed: '必须是整数',
    negativeFloatNotAllowed: '必须是非负小数',
    nonPositiveIntNotAllowed: '必须是正整数',
    dropOffNoSecurityNoInvalid: '落客点与安检点必须在对应数据表中存在',
    settings: {
      database: '数据库',
      host: '地址',
      user: '用户名',
      password: '密码',
      connectTimeout: '超时时限 (ms)'
    }
  }
}
