import React from 'react';
import styled from 'styled-components';
import { sendMessageToBackground, MessageLocation } from '@wbet/message-api'
import { EVENTS } from '../../../common'

const StyledWrapper = styled.div`
    min-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding:32px;
  .logo{
    width: 32px;
    height: 32px;
  }
  .desc{
    text-align: center;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    color:var(--window-title-color);
    max-width: 237px;
  }
  .login{
    cursor: pointer;
    color:#fff;
    border:none;
    background: #52EDFF;
    border-radius: 15px;
    padding:4px 12px;
    font-size: 12px;
    line-height: 16px;
  }
`;
export default function Login() {
  const handleLogin = () => {
    sendMessageToBackground({}, MessageLocation.Popup, EVENTS.LOGIN)
  }
  return (
    <StyledWrapper>
      <img className="logo" src="https://static.nicegoodthings.com/project/ext/webrowse.logo.png" />
      <p className="desc">Log in to Webrowse to cobrowse any websites with your teammates!</p>
      <button onClick={handleLogin} className="login">Sign In</button>
    </StyledWrapper>
  )
}
