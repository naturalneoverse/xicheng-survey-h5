/* eslint-disable */
window.SURVEY_CONFIG = {
  projectTitle: "西城区心理健康与传统文化素养调查",
  storageKey: "xicheng_survey_draft_v1",
  roles: [
    {
      id: "student",
      label: "学生",
      desc: "中小学生心理健康与传统文化素养调查",
      mascot: "xiaolin",
      bubbleColor: "#b7d6ea",
    },
    {
      id: "parent",
      label: "家长",
      desc: "家长心理状态与家庭教育调查",
      mascot: "xiaolin",
      bubbleColor: "#b7d6ea",
    },
    {
      id: "teacher",
      label: "教师",
      desc: "教师职业心理与育人状态调查",
      mascot: "xiaoqi",
      bubbleColor: "#7fb3d6",
    },
  ],
  optionSets: {
    primary: [
      { value: 1, label: "很少这样" },
      { value: 2, label: "有时这样" },
      { value: 3, label: "经常这样" },
    ],
    middle: [
      { value: 1, label: "从不这样" },
      { value: 2, label: "偶尔这样" },
      { value: 3, label: "经常这样" },
      { value: 4, label: "总是这样" },
    ],
    adult: [
      { value: 1, label: "从不这样" },
      { value: 2, label: "偶尔这样" },
      { value: 3, label: "经常这样" },
      { value: 4, label: "总是这样" },
    ],
  },
  privacy: {
    title: "隐私保护与知情同意",
    sections: [
      {
        heading: "一、调查目的",
        text: "本调查由西城区相关教育研究机构发起，旨在了解中小学生、家长与教师在心理健康、传统文化素养及家校协同方面的真实状态，仅用于学术研究与教育改进。",
      },
      {
        heading: "二、信息收集范围",
        text: "问卷将收集您填写的基本信息与作答结果。学生版含年级、班级、姓名等字段，仅用于研究内部分组分析，不纳入任何学业或品行评价，也不作为教师工作考核依据。",
      },
      {
        heading: "三、保密与使用",
        text: "所有数据将匿名或去标识化存储，严格限定于研究团队使用。我们不会向第三方出售或共享您的个人信息，不将作答内容用于商业营销。",
      },
      {
        heading: "四、您的权利",
        text: "您可以拒绝回答任何题目（选答题可留空）。提交前可随时返回修改。若不同意本说明，请退出本页面，我们将不会保存您的作答。",
      },
      {
        heading: "五、数据存储说明（当前版本）",
        text: "本界面为 Phase 0 预览版：作答数据暂存于您本机浏览器，尚未上传服务器。正式版上线后将另行告知存储方式与保留期限。",
      },
      {
        heading: "六、免责声明",
        text: "本问卷结果仅供参考，不构成医学诊断或心理咨询结论。若您或您的孩子正在经历严重心理困扰，请及时联系学校心理老师或专业医疗机构。",
      },
    ],
    consentLabel: "我已阅读并理解上述说明，自愿参与本次调查，并同意按上述规则处理我的作答信息。",
  },
};

window.SURVEY_REGISTRY = {
  student: function () {
    return window.SURVEY_STUDENT;
  },
  parent: function () {
    return window.SURVEY_PARENT;
  },
  teacher: function () {
    return window.SURVEY_TEACHER;
  },
};
