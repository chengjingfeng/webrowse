import { onMessageFromContentScript, MessageLocation } from '@wbet/message-api';
import { EVENTS } from '../../common';

// 监听来自content script 的触发事件
onMessageFromContentScript(MessageLocation.Background, {
  [EVENTS.JUMP_TAB]: (request) => {
    console.log('jump tab', request);
    chrome.tabs.update(Number(request.tabId), { active: true })
  },
  [EVENTS.OPEN_HOME]: () => {
    chrome.tabs.create(
      {
        active: true,
        url: 'https://nicegoodthings.com/'
      },
      null
    );
  },
  [EVENTS.LOGIN]: (request, sender) => {
    chrome.tabs.create(
      {
        openerTabId: sender.tab.id,
        active: true,
        url: `Login/index.html?tid=${sender.tab.id}`
      },
      null
    );
  },
  // get current tab info
  [EVENTS.CURRENT_TAB]: (request, sender) => {
    console.log('get current tab info', sender.tab);
    return sender.tab;
  },
});
