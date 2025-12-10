import React, { useState, useRef, useEffect } from 'react';

import { LiveMessage } from '../CustomTypes';
import { date2str, stringmask } from '../CommonUtil';

let setLogsFunc: Function | undefined;

function EventPanel() {
  const [logs, setLogs] = useState([
    { date: '时间', seq: '序号', decoded_type: '类型', nickname: '用户名', content: '内容', user_id: '用户ID' },
    // ... (initial logs here)
  ]);
  setLogsFunc = setLogs;
  const [forwardUrl, setForwardURL] = useState('');

  const logTableRef = useRef<HTMLDivElement>(null); // Ref for the table container

  // Use an effect to scroll the table container to the bottom whenever logs change
  useEffect(() => {
    if (logTableRef.current) {
      logTableRef.current.scrollTop = logTableRef.current.scrollHeight;
    }
    // Fetch config from main process when component is mounted
    const getForwardURL = async () => {
      const url = await window.electron.ipcRenderer.getForwardUrl();
      // setFormData(configFromMain);
      setForwardURL(url);
    };
    getForwardURL();
  }, [logs]);

  return (
    <div style={{ padding: '15px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '15px' }}>转发配置</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <label style={{ fontSize: '14px', fontWeight: 'bold', minWidth: '100px' }}>转发地址：</label>
        <input
          type="text"
          name="forward_url"
          id="forward_url"
          placeholder="转发地址，比如 http://127.0.0.1:8300/forward"
          style={{
            width: '450px',
            padding: '8px 12px',
            fontSize: '13px',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.3)',
            backgroundColor: 'rgba(255,255,255,0.9)',
            color: '#333'
          }}
          value={forwardUrl}
          onChange={(e) => {
            setForwardURL(e.target.value);
          }}
        />
        <button
          type="button"
          style={{
            padding: '8px 20px',
            fontSize: '13px',
            fontWeight: 'bold',
            borderRadius: '6px'
          }}
          onClick={() => {
            window.electron.ipcRenderer.sendMessage('wxlive-set-config', { forward_url: forwardUrl });
          }}
        >
          设置转发地址
        </button>
      </div>
      <h3 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '18px' }}>转发日志（最近20条）</h3>
      {/* <div>
        <button type="button" onClick={addLog}>
          追加一条测试日志
        </button>
      </div> */}
      <div ref={logTableRef} style={{ maxHeight: '500px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', padding: '10px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {logs.map((log, index) => (
              <tr key={log.seq} style={{ borderBottom: index === 0 ? '2px solid rgba(255,255,255,0.5)' : '1px solid rgba(255,255,255,0.1)' }}>
                <td align="left" style={{ width: '140px', padding: '8px 5px', fontSize: index === 0 ? '13px' : '12px', fontWeight: index === 0 ? 'bold' : 'normal' }}>
                  {log.date}
                </td>
                <td align="center" style={{ width: '50px', padding: '8px 5px', fontSize: index === 0 ? '13px' : '12px', fontWeight: index === 0 ? 'bold' : 'normal' }}>
                  {log.seq}
                </td>
                <td align="left" style={{ width: '100px', padding: '8px 5px', fontSize: index === 0 ? '13px' : '12px', fontWeight: index === 0 ? 'bold' : 'normal' }}>
                  {log.decoded_type}
                </td>
                <td align="left" style={{ width: '120px', padding: '8px 5px', fontSize: index === 0 ? '13px' : '12px', fontWeight: index === 0 ? 'bold' : 'normal' }}>
                  {log.nickname}
                </td>
                <td align="left" style={{ width: '130px', padding: '8px 5px', fontSize: index === 0 ? '13px' : '12px', fontWeight: index === 0 ? 'bold' : 'normal', fontFamily: 'monospace' }}>
                  {log.user_id}
                </td>
                <td align="left" style={{ padding: '8px 5px 8px 15px', fontSize: index === 0 ? '13px' : '12px', fontWeight: index === 0 ? 'bold' : 'normal' }}>
                  {log.content}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EventPanel;
window.electron.ipcRenderer.on('wxlive-event', (arg) => {
  // eslint-disable-next-line no-console
  console.log('this is a wxlive event');
  // eslint-disable-next-line no-console
  console.log(arg);
  // cast arg to EventData
  const castedEventData = arg as LiveMessage;
  const newLog = {
    date: date2str(new Date(castedEventData.msg_time)),
    decoded_type: castedEventData.decoded_type,
    nickname: castedEventData.nickname || '未知',
    content: castedEventData.content,
    seq: castedEventData.seq.toString(),
    user_id: stringmask(castedEventData.decoded_openid, 0, 16),
  };
  if (setLogsFunc !== undefined) {
    setLogsFunc((prevLogs: any) => [...prevLogs, newLog].slice(-20));
  }
});
