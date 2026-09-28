import { useState } from 'react';
import type { CampaignTask } from '../../demo/types';
import { useDemoDispatch } from '../../demo/store';
import { verifyCampaignActivity, type XVerificationState } from '../../services/xActivityService';
import { RollButton } from '../shared';
import Modal from './Modal';

export default function XActivitySimulator({ campaignId, task, onClose }: { campaignId: string; task: CampaignTask; onClose: () => void }) {
  const dispatch = useDemoDispatch();
  const [status, setStatus] = useState<XVerificationState>('not-started');

  const verify = async () => {
    setStatus('checking');
    const res = await verifyCampaignActivity(task.type);
    if (res.state === 'verified') dispatch({ type: 'COMPLETE_TASK', campaignId, taskId: task.id });
    setStatus(res.state);
  };

  return (
    <Modal title="Verify Activity" onClose={onClose}>
      <p className="app-sub" style={{ marginBottom: '1rem' }}>
        Complete the action below on X, then verify it here.
      </p>
      <div className="panel" style={{ marginBottom: '1.2rem' }}>
        <p className="section-label">Action</p>
        <p style={{ fontWeight: 700 }}>{task.title}</p>
        <p className="app-sub" style={{ marginTop: 6 }}>
          Reward: {task.reward} pts
        </p>
      </div>

      {status === 'not-started' && (
        <>
          <div className="status-line" style={{ marginBottom: '1.2rem' }}>
            <span className="status-dot" aria-hidden="true" />
            <span>Waiting for verification</span>
          </div>
          <RollButton text="Verify" onClick={verify} />
        </>
      )}

      {status === 'checking' && (
        <div className="status-line">
          <span className="spinner" aria-hidden="true" />
          <span>Checking X activity...</span>
        </div>
      )}

      {status === 'verified' && (
        <>
          <div className="status-line" style={{ marginBottom: '1.2rem' }}>
            <span className="status-dot is-live" aria-hidden="true" />
            <span>Verified</span>
          </div>
          <RollButton text="Done" onClick={onClose} />
        </>
      )}

      {status === 'not-verified' && (
        <>
          <p className="field-error" style={{ marginBottom: '1.2rem' }}>
            Could not verify this activity.
          </p>
          <RollButton text="Try Again" onClick={() => setStatus('not-started')} />
        </>
      )}

      {status === 'unavailable' && (
        <>
          <p className="field-error" style={{ marginBottom: '0.4rem' }}>
            X verification unavailable
          </p>
          <p className="app-sub" style={{ marginBottom: '1.2rem' }}>
            Additional X API access is required for this campaign activity.
          </p>
          <RollButton text="Close" onClick={onClose} />
        </>
      )}
    </Modal>
  );
}
