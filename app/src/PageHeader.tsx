import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';

export function PageHeader({ title }: { title: string }) {
  return (
    <div className="page-header row">
      <h1>{title}</h1>
      <span style={{ flex: 1 }}></span>
      <button className="plain" onClick={() => location.reload()}>
        <FontAwesomeIcon icon={faSync} />
      </button>
    </div>
  );
}
