/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react';

import log from 'electron-log';
// import { shell } from 'electron';
import { LiveInfo } from '../CustomTypes';
import { date2str, stringmask } from '../CommonUtil';

interface FormData {
  hostID: string;
  roomID: string;
  startTime: string;
  onlineNumber: number;
  likeCount: number;
  rewardAmount: number;
}
const initialFormData: FormData = {
  hostID: '',
  roomID: '',
  startTime: '',
  onlineNumber: 0,
  likeCount: 0,
  rewardAmount: 0,
};
let setDisplay: Function;
let formData: FormData;
let setFormData: Function;
let display: string;
let liveStatusUrl: string;

function StatusPanel() {
  [display, setDisplay] = useState('none');

  [formData, setFormData] = useState<FormData>(initialFormData);
  // window.electron.ipcRenderer.once('wxlive-status', (arg) => {
  //   // eslint-disable-next-line no-console
  //   console.log('2this is a wxlive event2');
  //   // eslint-disable-next-line no-console
  //   console.log(arg);
  // });

  const getLiveStatusURL = async () => {
    const httpServerPort = await window.electron.ipcRenderer.getConfig('http_server_port');
    liveStatusUrl = `http://localhost:${httpServerPort}/getLiveStatus`;
    log.info(liveStatusUrl);
  };
  getLiveStatusURL();

  const openLink = (event: any) => {
    event.preventDefault();
    const target = event.target as HTMLAnchorElement;
    log.info(`clicked ${target.href}`);
    window.electron.ipcRenderer.openExternalLink(target.href);
  };

  return (
    <div style={{ padding: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>直播监听</h1>
        <button
          type="button"
          style={{
            padding: '10px 30px',
            fontSize: '14px',
            fontWeight: 'bold',
            borderRadius: '8px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
          onClick={() => {
            window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);
            // eslint-disable-next-line no-console
            console.log('ipc-example', ['ping']);
          }}
        >
          🎬 开始监听
        </button>
      </div>
      <div id="wxlive-status-div" style={{ display }}>
        <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>📊 直播间信息</h3>
        <div style={{
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderRadius: '8px',
          padding: '15px',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <td align="right" style={{ padding: '8px 15px', fontSize: '13px', fontWeight: 'bold', width: '150px' }}>状态数据API：</td>
                <td style={{ padding: '8px 10px' }}>
                  <a style={{ color: '#00bfff', margin: '0px', fontSize: '12px', textDecoration: 'underline' }} href={liveStatusUrl} onClick={openLink}>
                    {liveStatusUrl}
                  </a>
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <td align="right" style={{ padding: '8px 15px', fontSize: '13px', fontWeight: 'bold' }}>主播ID：</td>
                <td style={{ padding: '8px 10px', fontSize: '13px', fontFamily: 'monospace' }}>{formData.hostID}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <td align="right" style={{ padding: '8px 15px', fontSize: '13px', fontWeight: 'bold' }}>直播间ID：</td>
                <td style={{ padding: '8px 10px', fontSize: '13px', fontFamily: 'monospace' }}>{formData.roomID}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <td align="right" style={{ padding: '8px 15px', fontSize: '13px', fontWeight: 'bold' }}>开播时间：</td>
                <td style={{ padding: '8px 10px', fontSize: '13px' }}>{formData.startTime}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <td align="right" style={{ padding: '8px 15px', fontSize: '13px', fontWeight: 'bold' }}>在线人数：</td>
                <td style={{ padding: '8px 10px', fontSize: '13px', color: '#4CAF50', fontWeight: 'bold' }}>👥 {formData.onlineNumber}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <td align="right" style={{ padding: '8px 15px', fontSize: '13px', fontWeight: 'bold' }}>点赞数：</td>
                <td style={{ padding: '8px 10px', fontSize: '13px', color: '#ff69b4', fontWeight: 'bold' }}>❤️ {formData.likeCount}</td>
              </tr>
              <tr>
                <td align="right" style={{ padding: '8px 15px', fontSize: '13px', fontWeight: 'bold' }}>微信币：</td>
                <td style={{ padding: '8px 10px', fontSize: '13px', color: '#ffd700', fontWeight: 'bold' }}>💰 {formData.rewardAmount}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StatusPanel;

window.electron.ipcRenderer.on('wxlive-status', (arg) => {
  // eslint-disable-next-line no-console
  console.log('this is a wxlive status');
  // eslint-disable-next-line no-console
  console.log(arg);
  // cast arg to StatusData
  const castedStatusData = arg as LiveInfo;
  if (formData !== undefined) {
    formData.hostID = stringmask(castedStatusData.wechat_uin, 3, 3);
    formData.roomID = stringmask(castedStatusData.live_id, 3, 3);
    formData.startTime = date2str(new Date(castedStatusData.start_time * 1000));
    formData.onlineNumber = castedStatusData.online_count;
    formData.likeCount = castedStatusData.like_count;
    formData.rewardAmount = castedStatusData.reward_total_amount_in_wecoin;
    // eslint-disable-next-line no-console
    console.log(formData);
    setFormData({
      ...formData,
    });
    setDisplay('block');
    // eslint-disable-next-line no-console
    console.log('after setFormData');
  }
});
