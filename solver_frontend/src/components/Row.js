import React from 'react';

function Row() {
  const rowStyles = {
    width: '280px',
    height: '52.5px',
    display: 'flex',
    justifyContent: 'space-between',
  };

  const boxStyles = {
    width: '52px',
    height: '52.5px',
    border: '1px solid #ccc',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    boxSizing: 'border-box',
  };

  const inputStyles = {
    backgroundColor: 'transparent',
    border: 'none',
    textAlign: 'center',
    color: 'white',
    fontSize: '1.5rem',
    width: '100%',
    height: '100%',
    outline: 'none',
  };


  return (
    <div style={rowStyles}>
      <div style={boxStyles}>
        <input type="text" maxLength="1" style={inputStyles} />
      </div>
      <div style={boxStyles}>
        <input type="text" maxLength="1" style={inputStyles} />
      </div>
      <div style={boxStyles}>
        <input type="text" maxLength="1" style={inputStyles} />
      </div>
      <div style={boxStyles}>
        <input type="text" maxLength="1" style={inputStyles} />
      </div>
      <div style={boxStyles}>
        <input type="text" maxLength="1" style={inputStyles} />
      </div>
    </div>
  );
}

export default Row;
