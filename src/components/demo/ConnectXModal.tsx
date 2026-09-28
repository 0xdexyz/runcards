import { useState } from 'react';
import { useDemo, useDemoDispatch } from '../../demo/store';
import { RollButton } from '../shared';
import Modal from './Modal';

function normalizeHandle(raw: string): string {
  const trimmed = raw.trim().replace(/^@/, '');
  return trimmed ? `@${trimmed}` : '';
}

export default function ConnectXModal({ onClose }: { onClose: () => void }) {
  const { user } = useDemo();
  const dispatch = useDemoDispatch();
  const [value, setValue] = useState(user.xHandle ?? '');
  const [error, setError] = useState('');

  const save = () => {
    const handle = normalizeHandle(value);
    if (!handle) {
      setError('Enter an X handle.');
      return;
    }
    dispatch({ type: 'CONNECT_X', handle });
    onClose();
  };

  const remove = () => {
    dispatch({ type: 'DISCONNECT_X' });
    onClose();
  };

  return (
    <Modal title="X Handle" onClose={onClose}>
      <p className="app-sub" style={{ marginBottom: '1rem' }}>
        Add your X handle so it shows up on your cards and campaigns.
      </p>
      <input
        placeholder="@yourhandle"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setError('');
        }}
        style={{ marginBottom: '0.6rem' }}
      />
      {error && (
        <p className="field-error" style={{ marginBottom: '0.6rem' }}>
          {error}
        </p>
      )}
      <div style={{ display: 'flex', gap: '0.6rem' }}>
        <RollButton text="Save" onClick={save} />
        {user.xConnected && <RollButton text="Remove" onClick={remove} />}
      </div>
    </Modal>
  );
}
