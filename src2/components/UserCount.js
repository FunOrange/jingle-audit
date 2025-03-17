import { useEffect, useState } from 'react';
import ReactGA from 'react-ga';
import auth from '../db/auth.json';

const useUserCount = () => {
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    // Initialize Google Analytics
    ReactGA.initialize(auth.analyticsTag);

    // Fetch real-time user count every 5 seconds
    const fetchUserCount = async () => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/analytics/v3/data/realtime?ids=ga:YOUR_VIEW_ID&metrics=rt:activeUsers&access_token=${
            ReactGA.ga().getAuthResponse().access_token
          }`,
        );
        const data = await response.json();
        const activeUsers = data.rows ? parseInt(data.rows[0][0]) : 0;
        setUserCount(activeUsers);
      } catch (error) {
        console.error('Error fetching live user count:', error);
      }
    };
    const interval = setInterval(fetchUserCount, 5000);

    return () => clearInterval(interval);
  }, []);

  return userCount;
};

export default useUserCount;
