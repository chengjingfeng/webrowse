import { useState, useEffect } from 'react';
import { onMessageFromBackground, sendMessageToBackground, MessageLocation } from '@wbet/message-api'
import { motion } from 'framer-motion'
import { IoLinkOutline } from 'react-icons/io5'
import { RiUserReceived2Fill, RiUserStarFill } from 'react-icons/ri'
import { EVENTS } from '../../../../common'
import StyledWidget from './styled';
import Tabs from './Tabs';
import Dots from './Dots'
import BehostPop from './BehostPop'
import FollowModeTipModal from './FollowModeTipModal'
// import FollowMode from './FollowMode';
import useCopy from '../hooks/useCopy';
// const mock_data = [{ id: 1, host: true, username: "杨二", photo: "https://files.authing.co/user-contents/photos/9be86bd9-5f18-419b-befa-2356dd889fe6.png" }, { id: 2, username: "杨二", photo: "https://files.authing.co/user-contents/photos/9be86bd9-5f18-419b-befa-2356dd889fe6.png" }]
let followModalClosed = false;
let tempTitle = '';
export default function Floater({ showLeaveModal, dragContainerRef = null }) {
  const [editable, setEditable] = useState(false);
  const [followTipModalVisible, setFollowTipModalVisible] = useState(false);
  const [behostPopoverVisible, setBehostPopoverVisible] = useState(false)
  const [users, setUsers] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [title, setTitle] = useState("")
  const [activeTabId, setActiveTabId] = useState(null)
  const [currUser, setCurrUser] = useState(undefined);
  const [host, setHost] = useState(undefined)
  const [visible, setVisible] = useState({ tab: true, follow: false, audio: false });
  const [inviteLink, setInviteLink] = useState('');
  const [popup, setPopup] = useState(false)
  const { copied, copy } = useCopy();
  const toggleVisible = ({ target }) => {
    const { type } = target.dataset;
    // setVisible({tab:false,follow:false})
    const value = !visible[type];
    sendMessageToBackground({ tab: type, visible: value }, MessageLocation.Content, EVENTS.CHANGE_FLOATER_TAB)
  }
  const handleCopyLink = () => {
    if (copied) return;
    copy(inviteLink);
  }
  const togglePopup = () => {
    setPopup(prev => !prev)
  }
  const handleAllLeave = () => {
    showLeaveModal(true);
    setPopup(false)
  }
  const handleLeave = () => {
    showLeaveModal();
    setPopup(false)
  }
  useEffect(() => {
    onMessageFromBackground(MessageLocation.Content, {
      [EVENTS.GET_INVITE_LINK]: (url) => {
        console.log("get link", url);
        setInviteLink(url)
      },
      [EVENTS.UPDATE_FLOATER]: ({ title = "", floaterTabVisible, users, tabs, userId }) => {
        console.log({ floaterTabVisible, users, tabs, userId });
        setVisible(floaterTabVisible);
        setUsers(users);
        setTabs(tabs);
        let tmp = users.find(u => u.id == userId);
        let tmp2 = users.find(u => u.host);
        setCurrUser(tmp);
        setHost(tmp2);
        setTitle(title)
      }
    });
    // 初次初始化
    sendMessageToBackground({}, MessageLocation.Content, EVENTS.UPDATE_TABS);
    sendMessageToBackground({}, MessageLocation.Content, EVENTS.GET_INVITE_LINK);
  }, []);
  useEffect(() => {
    if (host && tabs && tabs.length) {
      let activeTab = tabs.find(t => t.index == host.activeIndex);
      if (activeTab) {
        setActiveTabId(activeTab.id)
      }
    }
  }, [host, tabs]);
  useEffect(() => {
    if (currUser?.follow) {
      // 立即同步
      sendMessageToBackground({ tabId: activeTabId }, MessageLocation.Content, EVENTS.JUMP_TAB);
    }
    setFollowTipModalVisible(!!currUser?.follow)

  }, [currUser, activeTabId]);
  const closeBlock = (evt) => {
    const { type } = evt.target.dataset;
    if (!type) return;
    sendMessageToBackground({ tab: type, visible: false }, MessageLocation.Content, EVENTS.CHANGE_FLOATER_TAB)
  }
  const handleTitleChange = (evt) => {
    setTitle(evt.target.value)
  }
  const handleTitleClick = (evt) => {
    if (editable) return;
    tempTitle = evt.target.value;
    setEditable(true);
    evt.target.select();
  }
  const handleTitleBlur = () => {
    setEditable(false);
    if (!title || tempTitle == title) return;
    sendMessageToBackground({ title }, MessageLocation.Content, EVENTS.UPDATE_WIN_TITLE)
  }
  const handleEnterKey = (evt) => {
    if (evt.keyCode == 13) {
      evt.target.setSelectionRange(0, 0)
      evt.target.blur();
    }
  }
  const handleCancelHostPop = () => {
    setBehostPopoverVisible(false)
  }

  const handleBeHost = () => {
    chrome.storage.sync.get(['BECOME_HOST_ASK'], (res) => {
      let enable = (host && host.id == currUser?.id) ? false : true;
      if (!res.BECOME_HOST_ASK && enable) {
        setBehostPopoverVisible(true);
        return;
      } else {
        // 成为host
        sendMessageToBackground({
          data: {
            cmd: EVENTS.BE_HOST,
            payload: {
              enable
            }
          }
        }, MessageLocation.Content, EVENTS.SOCKET_MSG)
      }
    });
  }
  const toggleOptsVisible = (evt) => {
    evt.stopPropagation();
    const { currentTarget } = evt;
    currentTarget.classList.toggle('expand')
  }
  const handleItemsMouseLeave = ({ currentTarget }) => {
    currentTarget.parentElement.classList.remove('expand')
  }
  const { tab } = visible;
  const isHost = host && host.id == currUser?.id;
  console.log({ users, host, currUser });
  return (
    <>
      <motion.div
        drag
        dragMomentum={false}
        dragConstraints={dragContainerRef}
        whileDrag={{ scale: 1.12 }}
        style={{ position: 'absolute', right: '24px', bottom: '24px' }}
      >
        <StyledWidget >
          <div className="top">
            <div className={`title`}>
              <input onKeyDown={handleEnterKey} onBlur={handleTitleBlur} onClick={handleTitleClick} readOnly={!editable} value={title || 'Temporary Window'} onChange={handleTitleChange} />
            </div>
            <div className="quit">
              {popup && <div className="selects">
                {currUser?.creator && <button className="select" onClick={handleAllLeave}>End Session For All</button>}
                <button className="select" onClick={handleLeave}>Leave Session</button>
              </div>}
              <button onClick={togglePopup} className="btn">
                {popup ? 'Cancel' : (currUser?.creator ? 'End' : 'Leave')}
              </button>
            </div>
          </div>
          <div className="opts">
            <div className="btns">
              <button title="Tab Status" className={`btn tab ${tab ? 'curr' : ''}`} data-type='tab' onClick={toggleVisible}></button>
              {/* <button title="Follow Mode" className={`btn follow ${follow ? 'curr' : ''}`} data-type='follow' onClick={toggleVisible}></button> */}
              {/* <button title="Audio Channel" className={`btn audio ${audio ? 'curr' : ''}`} data-type='audio' onClick={showVeraPanel}></button> */}
            </div>
            {inviteLink && <div className="cmds">
              <div className="cmd host">
                {isHost ? <RiUserStarFill size={16} color="#68D6DD" /> : <RiUserReceived2Fill className="icon" size={16} />}
                <button className={`btn`} onClick={handleBeHost}>{isHost ? `Stop Hosting` : `Become Host`}</button>
              </div>
              <div className="cmd copy">
                <IoLinkOutline className="icon" size={16} />
                <button className={`btn ${copied ? 'copied' : ''}`} onClick={handleCopyLink}>{copied ? `Copied` : `Copy Link`}</button>
              </div>
              <div className="others" onClick={toggleOptsVisible}>
                <Dots />
                <ul className="items" onMouseLeave={handleItemsMouseLeave}>
                  <li className="item" onClick={handleCopyLink}>Copy Link</li>
                  {/* <li className="item" onClick={null}>Save Window</li> */}
                  <li className="item" onClick={handleLeave}>Leave</li>
                </ul>
              </div>
            </div>}
          </div>
          {tab && <Tabs tabs={tabs} users={users} closeBlock={closeBlock} />}
          {/* {follow && <FollowMode host={host} currUser={currUser} closeBlock={closeBlock} />} */}
          {behostPopoverVisible && <BehostPop handleCancelHostPop={handleCancelHostPop} />}
        </StyledWidget>
      </motion.div>
      {followTipModalVisible && !followModalClosed && <FollowModeTipModal closeModal={() => {
        setFollowTipModalVisible(false);
        followModalClosed = true;
      }} />}
    </>
  );
}
