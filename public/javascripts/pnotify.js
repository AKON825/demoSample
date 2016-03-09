/**
 * 使用pnotity套件 呼叫堆疊式訊息框
 *
 * 需依賴bower pnotity套件中的以下檔案
 * pnotify/pnotify.core.js
 * pnotify/pnotify.buttons.js
 * pnotify/pnotify.core.css
 * pnotify/pnotify.buttons.css
 *
 * 頁面中給予css設定如下
 * 覆寫pnotify元件 使其置中
 * .ui-pnotify {  left: 0;  right: 0;  margin: 0px auto;  }
 * 可以將訊息框置於畫面中央
 */
var stackBottomright = {"dir1": "up", "dir2": "left", "firstpos1": 25, "firstpos2": 25};
// 呼叫api錯誤訊息
function notifyAlert(text, title) {
  if (!title) {
    title = 'Api錯誤訊息!'
  }

  new PNotify({
    buttons: {
      closer: true,
      sticker: false,
      closer_hover: false
    },
    stack: stackBottomright,
    addclass: 'stack-bottomright',
    hide: false,
    type: 'error',
    animate_speed: "fast",
    position_animate_speed: 100,
    width: '50%',
    min_height: "80px",
    title: title,
    text: text
  });
};

function notifySuccess(text, title) {
  new PNotify({
    buttons: {
      closer: true,
      sticker: false,
      closer_hover: false
    },
    stack: stackBottomright,
    addclass: 'stack-bottomright',
    hide: true,
    type: 'success',
    animate_speed: "normal",
    position_animate_speed: 100,
    width: '30%',
    min_height: "80px",
    title: title,
    text: text,
    delay: 2000,
    mouse_reset: false
  });
};

PNotify.prototype.options.styling = "bootstrap3";