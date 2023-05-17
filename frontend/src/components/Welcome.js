import React, { useEffect, useState } from "react";
import axios from "axios";

axios.defaults.withCredentials = true;
let firstRender = true;

const Welcome = () => {
  const [user, setUser] = useState();

  const refreshToken = async () => {
    const response = await axios
      .get("http://localhost:5000/api/refresh", {
        withCredentials: true,
      })
      .catch((err) => console.log(err));

    const data = await response.data;
    return data;
  };

  const sendRequest = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/user", {
        withCredentials: true,
      });
      const data = res.data;
      return data;
    } catch (err) {
      console.log(err);
      throw err; // Throw the error to reject the promise
    }
  };

  useEffect(() => {
    if (firstRender) {
      firstRender = false;
      sendRequest()
        .then((data) => setUser(data.user))
        .catch((error) => console.log("Error: ", error));
    }
    let interval = setInterval(() => {
      refreshToken().then((data) => setUser(data.user));
    }, 1000 * 29);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <p>HELLO</p>
      {user && <h1>{user.name}</h1>}
    </div>
  );
};

export default Welcome;
