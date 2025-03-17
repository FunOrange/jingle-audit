import React from 'react';
import DailyGuessLabel from './DailyGuessLabel';

const FiveGuessesRow = ({ dailyResults }) => {
  console.log(dailyResults);
  return (
    <table
      style={{
        marginBottom: '10px',
        width: '100%',
        pointerEvents: 'none',
      }}
    >
      <tbody>
        <tr>
          {dailyResults.map((result) => {
            <td>
              <DailyGuessLabel number={result || '-'} />
            </td>;
          })}
        </tr>
      </tbody>
    </table>
  );
};

export default DailyGuessLabel;
