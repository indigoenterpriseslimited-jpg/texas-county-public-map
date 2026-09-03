import React from 'react';

function TexasFlag({ className = 'texas-flag' }) {
  return (
    <svg className={className} viewBox="0 0 3 2" role="img" aria-label="Flag of Texas">
      <rect width="1" height="2" fill="#002868" />
      <rect x="1" width="2" height="1" fill="#fff" />
      <rect x="1" y="1" width="2" height="1" fill="#bf0a30" />
      <polygon fill="#fff" points="0.5,0.56 0.603,0.858 0.918,0.864 0.667,1.055 0.759,1.357 0.5,1.177 0.241,1.357 0.333,1.055 0.082,0.864 0.397,0.858" />
    </svg>
  );
}

export default TexasFlag;
