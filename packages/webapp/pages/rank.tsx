import React, { ReactElement, useContext, useEffect, useState } from 'react';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';

const Rank = (): ReactElement => {
  const { user } = useContext(AuthContext);
  const [reputation, setReputation] = useState(0);

  useEffect(() => {
    if (user) {
      setReputation(user.reputation);
    }
  },[user]);

  const getMaxRank = () => {
    const maxRank = Math.ceil(reputation / 10) * 10;
    return maxRank;
  };

  const getRankDifference = () => {
    const rankDiff = getMaxRank() - reputation;
    console.log(reputation);
    console.log(rankDiff);
    return rankDiff;
  };


  return (
    <>
      {user ? (
        <div>
          <h1 className="mt-10 font-bold typo-title1">
            Current reputation is {reputation}. Your only have {getRankDifference()} points away from hitting{' '}
            {getMaxRank()}
          </h1>
          <Button className="btn btn-primary" onClick={() => setReputation(reputation +5)}>Add 10 to Reputation</Button>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
};

export default Rank;
