(function () {
  "use strict";

  var CONFIG = window.SURVEY_CONFIG;
  var appEl = document.getElementById("app");
  var toastTimer = null;

  var state = {
    screen: "landing",
    roleId: "",
    survey: null,
    basicInfo: {},
    answers: {},
    openAnswer: "",
    privacyConsent: false,
    stepIndex: 0,
    steps: [],
    submittedAt: "",
  };

  function esc(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function showToast(msg) {
    var el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove("show");
    }, 2200);
  }

  function getRoleMeta(roleId) {
    return CONFIG.roles.find(function (r) {
      return r.id === roleId;
    });
  }

  function loadSurvey(roleId) {
    return window.SURVEY_REGISTRY[roleId]();
  }

  function buildSteps(survey) {
    var steps = [];
    survey.parts.forEach(function (part) {
      part.subsections.forEach(function (sub, subIdx) {
        steps.push({
          partNum: part.part,
          partTitle: part.title,
          partIntro: part.intro,
          showPartBanner: subIdx === 0,
          subsectionTitle: sub.title,
          subsectionIntro: sub.intro || "",
          questions: sub.questions,
        });
      });
    });
    if (survey.openQuestion) {
      steps.push({ type: "open", openQuestion: survey.openQuestion });
    }
    return steps;
  }

  function getOptionSet() {
    if (state.roleId === "student") {
      return state.basicInfo.schoolLevel === "primary"
        ? CONFIG.optionSets.primary
        : CONFIG.optionSets.middle;
    }
    return CONFIG.optionSets.adult;
  }

  function countAnswerableQuestions() {
    var n = 0;
    state.steps.forEach(function (step) {
      if (step.questions) n += step.questions.length;
    });
    return n;
  }

  function countAnswered() {
    var n = 0;
    Object.keys(state.answers).forEach(function (k) {
      if (state.answers[k] != null && state.answers[k] !== "") n += 1;
    });
    return n;
  }

  function saveDraft() {
    try {
      localStorage.setItem(
        CONFIG.storageKey,
        JSON.stringify({
          roleId: state.roleId,
          basicInfo: state.basicInfo,
          answers: state.answers,
          openAnswer: state.openAnswer,
          privacyConsent: state.privacyConsent,
          stepIndex: state.stepIndex,
          screen: state.screen,
          updatedAt: Date.now(),
        }),
      );
    } catch (e) {
      /* ignore quota errors */
    }
  }

  function loadDraft() {
    try {
      var raw = localStorage.getItem(CONFIG.storageKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function clearDraft() {
    localStorage.removeItem(CONFIG.storageKey);
  }

  function renderBubble(color, html) {
    return (
      '<div class="bubble-row">' +
      '<div class="chat-bubble card" style="--bubble-border:' +
      esc(color) +
      '">' +
      html +
      "</div></div>"
    );
  }

  function renderHeader(title, sub) {
    return (
      '<header class="header">' +
      '<p class="header-org">西城区教育调查</p>' +
      "<h1 class=\"header-title\">" +
      esc(title) +
      "</h1>" +
      (sub ? '<p class="header-sub">' + esc(sub) + "</p>" : "") +
      "</header>"
    );
  }

  function renderFooter(primaryLabel, primaryAction, opts) {
    opts = opts || {};
    var backBtn = opts.showBack
      ? '<button type="button" class="btn-nav-back" data-action="back">' + esc(opts.backLabel || "上一步") + "</button>"
      : "";
    var navClass = opts.showBack ? "btn-nav btn-nav--split" : "btn-nav btn-nav--single";
    return (
      '<div class="page-footer">' +
      '<div class="' +
      navClass +
      '">' +
      backBtn +
      '<button type="button" class="btn-nav-next" data-action="' +
      esc(primaryAction) +
      '"' +
      (opts.primaryDisabled ? " disabled" : "") +
      ">" +
      esc(primaryLabel) +
      "</button></div></div>"
    );
  }

  function renderTechSupport() {
    var ts = CONFIG.techSupport;
    if (!ts) return "";
    return (
      '<footer class="tech-support" aria-label="技术支持">' +
      '<span class="tech-support__text">' +
      esc(ts.text) +
      '</span><img class="tech-support__icon" src="' +
      esc(ts.logo) +
      '" alt="" width="28" height="28" /></footer>'
    );
  }

  function renderLanding() {
    var rolesHtml = CONFIG.roles
      .map(function (role) {
        return (
          '<button type="button" class="role-card" data-action="pick-role" data-role="' +
          esc(role.id) +
          '">' +
          '<img class="role-icon" src="' +
          esc(role.icon) +
          '" alt="' +
          esc(role.label) +
          '" />' +
          "<span><span class=\"role-label\">" +
          esc(role.label) +
          "</span>" +
          '<span class="role-desc">' +
          esc(role.desc) +
          "</span></span></button>"
        );
      })
      .join("");

    appEl.innerHTML =
      '<div class="page">' +
      '<div class="page-scroll">' +
      renderHeader(CONFIG.projectTitle, "请选择您的身份进入对应问卷") +
      '<div class="role-grid">' +
      rolesHtml +
      "</div>" +
      '<p class="note-box" style="margin-top:16px">本调查仅用于学术研究。请先选择身份，阅读隐私说明并同意后再作答。</p>' +
      "</div></div>";
  }

  function renderPrivacy() {
    var meta = getRoleMeta(state.roleId);
    var sections = CONFIG.privacy.sections
      .map(function (s) {
        return "<h3>" + esc(s.heading) + "</h3><p>" + esc(s.text) + "</p>";
      })
      .join("");

    appEl.innerHTML =
      '<div class="page">' +
      '<div class="page-scroll">' +
      renderHeader("隐私保护与知情同意", meta ? meta.label + "版问卷" : "") +
      renderBubble(
        meta ? meta.bubbleColor : "#b7d6ea",
        "请先阅读以下说明。只有勾选同意后，才能开始填写问卷。",
      ) +
      '<div class="card"><h2 class="card-title">' +
      esc(CONFIG.privacy.title) +
      '</h2><div class="privacy-box">' +
      sections +
      '</div><label class="consent-row"><input type="checkbox" id="consentCheck"' +
      (state.privacyConsent ? " checked" : "") +
      " /><span>" +
      esc(CONFIG.privacy.consentLabel) +
      "</span></label></div></div>" +
      renderFooter("同意并继续", "privacy-next", {
        showBack: true,
        primaryDisabled: !state.privacyConsent,
      }) +
      "</div>";
  }

  function renderField(field) {
    if (field.showWhen) {
      var cur = state.basicInfo[field.showWhen.key];
      if (cur !== field.showWhen.value) return "";
    }
    var val = state.basicInfo[field.key] != null ? state.basicInfo[field.key] : "";
    var req = field.required ? '<span class="req">*</span>' : "";
    var html =
      '<div class="field" data-field="' +
      esc(field.key) +
      '"><label class="field-label">' +
      esc(field.label) +
      req +
      "</label>";

    if (field.type === "select") {
      html += '<select class="field-select" data-input="' + esc(field.key) + '">';
      html += '<option value="">请选择</option>';
      field.options.forEach(function (opt) {
        html +=
          '<option value="' +
          esc(opt) +
          '"' +
          (val === opt ? " selected" : "") +
          ">" +
          esc(opt) +
          "</option>";
      });
      html += "</select>";
    } else if (field.type === "radio") {
      html += '<div class="radio-group">';
      field.options.forEach(function (opt) {
        var selected = val === opt.value ? " selected" : "";
        html +=
          '<label class="radio-pill' +
          selected +
          '"><input type="radio" name="' +
          esc(field.key) +
          '" data-input="' +
          esc(field.key) +
          '" value="' +
          esc(opt.value) +
          '"' +
          (val === opt.value ? " checked" : "") +
          " />" +
          esc(opt.label) +
          "</label>";
      });
      html += "</div>";
    } else {
      html +=
        '<input class="field-input" data-input="' +
        esc(field.key) +
        '" value="' +
        esc(val) +
        '" placeholder="请填写" />';
    }
    return html + "</div>";
  }

  function renderBasicInfo() {
    var meta = getRoleMeta(state.roleId);
    var fields = state.survey.basicInfoFields.map(renderField).join("");
    appEl.innerHTML =
      '<div class="page">' +
      '<div class="page-scroll">' +
      renderHeader("基本信息", state.survey.title) +
      renderBubble(meta.bubbleColor, "请先填写基本信息。带 <span style=\"color:#d9534f\">*</span> 为必填项。") +
      '<div class="card"><h2 class="card-title">基本信息</h2>' +
      fields +
      "</div></div>" +
      renderFooter("下一步", "basic-next", { showBack: true }) +
      "</div>";
  }

  function renderGuide() {
    var meta = getRoleMeta(state.roleId);
    var g = state.survey.guide;
    var optionHint =
      state.roleId === "student"
        ? "小学生三档：很少这样 / 有时这样 / 经常这样；初中生四档：从不这样 / 偶尔这样 / 经常这样 / 总是这样。"
        : g.answerNote;

    appEl.innerHTML =
      '<div class="page">' +
      '<div class="page-scroll">' +
      renderHeader("问卷说明", "") +
      renderBubble(
        meta.bubbleColor,
        '<div class="bubble-greeting">' +
          esc(g.greeting) +
          "</div>" +
          esc(g.body),
      ) +
      '<div class="card"><h2 class="card-title">作答说明</h2><p class="card-desc">' +
      esc(optionHint) +
      '</p><div class="note-box">' +
      esc(g.scoringNote) +
      "</div></div></div>" +
      renderFooter("开始答题", "guide-start", { showBack: true }) +
      "</div>";
  }

  function renderSurveyStep() {
    var step = state.steps[state.stepIndex];
    var meta = getRoleMeta(state.roleId);
    var totalQ = countAnswerableQuestions();
    var answered = countAnswered();
    var progress = totalQ ? Math.round((answered / totalQ) * 100) : 0;
    var options = getOptionSet();
    var body = "";

    if (step.type === "open") {
      var oq = step.openQuestion;
      body =
        '<div class="card survey-step-start"><h2 class="card-title">' +
        esc(oq.title) +
        '</h2><p class="card-desc">' +
        esc(oq.intro) +
        '</p><div class="field"><label class="field-label">' +
        esc(oq.text) +
        '</label><textarea class="field-textarea" id="openAnswer" placeholder="' +
        esc(oq.placeholder) +
        '">' +
        esc(state.openAnswer) +
        "</textarea></div></div>";
    } else {
      body += '<div class="progress-wrap survey-step-start"><div class="progress-meta"><span>第 ' +
        (state.stepIndex + 1) +
        " / " +
        state.steps.length +
        ' 步</span><span>已完成 ' +
        answered +
        " / " +
        totalQ +
        " 题</span></div>" +
        '<div class="progress-bar"><div class="progress-fill" style="width:' +
        progress +
        '%"></div></div></div>';

      if (step.showPartBanner) {
        body += '<div class="part-banner">' + esc(step.partTitle) + "</div>";
        if (step.partIntro) {
          body += '<p class="subsection-intro">' + esc(step.partIntro) + "</p>";
        }
      }

      body += '<div class="card"><h3 class="subsection-title">' + esc(step.subsectionTitle) + "</h3>";
      if (step.subsectionIntro) {
        body += '<p class="subsection-intro">' + esc(step.subsectionIntro) + "</p>";
      }

      step.questions.forEach(function (q) {
        var selected = state.answers[q.id];
        var tag = q.mismatchPair
          ? '<span class="mismatch-tag">配对' + esc(q.mismatchPair) + "</span>"
          : "";
        body += '<div class="question-block" data-qid="' + q.id + '">';
        body += '<div class="question-head"><span class="question-num">' + q.id + '</span>';
        body += '<div class="question-text">' + esc(q.text) + tag + "</div></div>";
        body += '<div class="option-list">';
        options.forEach(function (opt) {
          body +=
            '<button type="button" class="option-btn' +
            (selected === opt.value ? " selected" : "") +
            '" data-action="pick-option" data-qid="' +
            q.id +
            '" data-value="' +
            opt.value +
            '">' +
            esc(opt.label) +
            "</button>";
        });
        body += "</div></div>";
      });
      body += "</div>";
    }

    var primaryLabel = step.type === "open" ? "提交问卷" : state.stepIndex === state.steps.length - 1 ? "进入选答题" : "下一组";
    if (step.type === "open") primaryLabel = "提交问卷";
    else if (state.stepIndex === state.steps.length - 2 && state.steps[state.steps.length - 1].type === "open") {
      primaryLabel = "下一组";
    } else if (state.stepIndex === state.steps.length - 1) {
      primaryLabel = "提交问卷";
    }

    appEl.innerHTML =
      '<div class="page">' +
      '<div class="page-scroll">' +
      renderHeader(state.survey.title, meta.label + " · 正在作答") +
      body +
      "</div>" +
      renderFooter(primaryLabel, "survey-next", { showBack: true }) +
      "</div>";
  }

  function renderComplete() {
    var meta = getRoleMeta(state.roleId);
    appEl.innerHTML =
      '<div class="page">' +
      '<div class="page-scroll">' +
      renderHeader("提交成功", "") +
      renderBubble(
        meta.bubbleColor,
        "问卷结束，感谢你的认真作答！你的数据已暂存于本机浏览器（Phase 0 预览版，尚未上传服务器）。",
      ) +
      '<div class="card"><div class="complete-icon">✓</div>' +
      '<h2 class="complete-title">感谢参与</h2>' +
      '<p class="complete-desc">提交时间：' +
      esc(state.submittedAt) +
      '<br/>角色：' +
      esc(meta.label) +
      "<br/>封闭题：" +
      countAnswered() +
      " 题</p>" +
      '<div class="note-box">正式版将接入服务端存储与计分分析。当前版本不含错位度计算与报告生成。</div></div></div>' +
      '<div class="page-footer"><div class="btn-nav btn-nav--split">' +
      '<button type="button" class="btn-nav-back" data-action="restart">返回首页</button>' +
      '<button type="button" class="btn-nav-next" data-action="export">导出 JSON</button>' +
      "</div></div>" +
      renderTechSupport() +
      "</div>";
  }

  function scrollPageToTop() {
    requestAnimationFrame(function () {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      var scrollEl = appEl.querySelector(".page-scroll");
      if (scrollEl) scrollEl.scrollTop = 0;
      if (state.screen === "survey") {
        var anchor = appEl.querySelector(".survey-step-start");
        if (anchor) anchor.scrollIntoView({ block: "start" });
      }
    });
  }

  function render(scrollToTop) {
    if (state.screen === "landing") renderLanding();
    else if (state.screen === "privacy") renderPrivacy();
    else if (state.screen === "basic") renderBasicInfo();
    else if (state.screen === "guide") renderGuide();
    else if (state.screen === "survey") renderSurveyStep();
    else if (state.screen === "complete") renderComplete();
    saveDraft();
    if (scrollToTop !== false) scrollPageToTop();
  }

  function validateBasicInfo() {
    var missing = [];
    state.survey.basicInfoFields.forEach(function (field) {
      if (!field.required) return;
      if (field.showWhen && state.basicInfo[field.showWhen.key] !== field.showWhen.value) return;
      if (!state.basicInfo[field.key]) missing.push(field.label);
    });
    if (missing.length) {
      showToast("请填写：" + missing.join("、"));
      return false;
    }
    return true;
  }

  function validateCurrentStep() {
    var step = state.steps[state.stepIndex];
    if (!step || step.type === "open") return true;
    var missing = [];
    step.questions.forEach(function (q) {
      if (state.answers[q.id] == null || state.answers[q.id] === "") missing.push(q.id);
    });
    if (missing.length) {
      showToast("请完成本组全部题目（未完成：第 " + missing.join("、") + " 题）");
      return false;
    }
    return true;
  }

  function buildSubmissionPayload() {
    return {
      version: "phase0-local",
      role: state.roleId,
      title: state.survey.title,
      basicInfo: state.basicInfo,
      answers: state.answers,
      openAnswer: state.openAnswer,
      privacyConsent: state.privacyConsent,
      submittedAt: state.submittedAt,
      optionSetUsed:
        state.roleId === "student"
          ? state.basicInfo.schoolLevel === "primary"
            ? "primary"
            : "middle"
          : "adult",
    };
  }

  function exportJson() {
    var payload = buildSubmissionPayload();
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "xicheng-survey-" + state.roleId + "-" + Date.now() + ".json";
    a.click();
    URL.revokeObjectURL(a.href);
    showToast("已导出 JSON 文件");
  }

  function resetAll() {
    state = {
      screen: "landing",
      roleId: "",
      survey: null,
      basicInfo: {},
      answers: {},
      openAnswer: "",
      privacyConsent: false,
      stepIndex: 0,
      steps: [],
      submittedAt: "",
    };
    clearDraft();
    render();
  }

  function pickRole(roleId) {
    state.roleId = roleId;
    state.survey = loadSurvey(roleId);
    state.basicInfo = {};
    state.answers = {};
    state.openAnswer = "";
    state.stepIndex = 0;
    state.steps = buildSteps(state.survey);
    state.screen = "privacy";
    render();
  }

  function tryResumeDraft() {
    var draft = loadDraft();
    if (!draft || !draft.roleId || draft.screen === "landing" || draft.screen === "complete") return;
    if (!window.SURVEY_REGISTRY[draft.roleId]) return;
    state.roleId = draft.roleId;
    state.survey = loadSurvey(draft.roleId);
    state.basicInfo = draft.basicInfo || {};
    state.answers = draft.answers || {};
    state.openAnswer = draft.openAnswer || "";
    state.privacyConsent = !!draft.privacyConsent;
    state.stepIndex = draft.stepIndex || 0;
    state.steps = buildSteps(state.survey);
    state.screen = draft.screen || "privacy";
    render();
    showToast("已恢复上次作答进度");
  }

  appEl.addEventListener("click", function (e) {
    var t = e.target.closest("[data-action]");
    if (!t) return;
    var action = t.getAttribute("data-action");

    if (action === "pick-role") {
      pickRole(t.getAttribute("data-role"));
      return;
    }

    if (action === "back") {
      if (state.screen === "privacy") state.screen = "landing";
      else if (state.screen === "basic") state.screen = "privacy";
      else if (state.screen === "guide") state.screen = "basic";
      else if (state.screen === "survey") {
        if (state.stepIndex > 0) state.stepIndex -= 1;
        else state.screen = "guide";
      }
      render();
      return;
    }

    if (action === "privacy-next") {
      if (!state.privacyConsent) {
        showToast("请先勾选同意");
        return;
      }
      state.screen = "basic";
      render();
      return;
    }

    if (action === "basic-next") {
      if (!validateBasicInfo()) return;
      state.screen = "guide";
      render();
      return;
    }

    if (action === "guide-start") {
      state.screen = "survey";
      state.stepIndex = 0;
      render();
      return;
    }

    if (action === "pick-option") {
      var qid = Number(t.getAttribute("data-qid"));
      var val = Number(t.getAttribute("data-value"));
      state.answers[qid] = val;
      render(false);
      return;
    }

    if (action === "survey-next") {
      var step = state.steps[state.stepIndex];
      if (step && step.type === "open") {
        var ta = document.getElementById("openAnswer");
        if (ta) state.openAnswer = ta.value.trim();
        state.submittedAt = new Date().toLocaleString("zh-CN");
        try {
          localStorage.setItem(
            CONFIG.storageKey + "_submission_" + state.roleId,
            JSON.stringify(buildSubmissionPayload()),
          );
        } catch (err) {
          /* ignore */
        }
        state.screen = "complete";
        render();
        return;
      }
      if (!validateCurrentStep()) return;
      if (state.stepIndex < state.steps.length - 1) {
        state.stepIndex += 1;
        render();
      } else {
        state.submittedAt = new Date().toLocaleString("zh-CN");
        state.screen = "complete";
        render();
      }
      return;
    }

    if (action === "restart") {
      resetAll();
      return;
    }

    if (action === "export") {
      exportJson();
    }
  });

  appEl.addEventListener("change", function (e) {
    if (e.target.id === "consentCheck") {
      state.privacyConsent = e.target.checked;
      var btn = appEl.querySelector('[data-action="privacy-next"]');
      if (btn) btn.disabled = !state.privacyConsent;
      saveDraft();
      return;
    }
    var key = e.target.getAttribute("data-input");
    if (!key) return;
    if (e.target.type === "radio") {
      if (e.target.checked) state.basicInfo[key] = e.target.value;
    } else {
      state.basicInfo[key] = e.target.value;
    }
    saveDraft();
    if (state.screen === "basic") renderBasicInfo();
  });

  appEl.addEventListener("input", function (e) {
    var key = e.target.getAttribute("data-input");
    if (!key) return;
    state.basicInfo[key] = e.target.value;
    saveDraft();
  });

  renderLanding();
  tryResumeDraft();
})();
