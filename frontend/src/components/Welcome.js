import React, { useEffect, useState } from "react";
import axios from "axios";

axios.defaults.withCredentials = true;

const Welcome = () => {
  const [user, setUser] = useState();

  const sendRequest = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/user", {
        withCredentials: true,
      });
      console.log("res:", res);
      const data = res.data;
      return data;
    } catch (err) {
      console.log(err);
      throw err; // Throw the error to reject the promise
    }
  };

  useEffect(() => {
    sendRequest()
      .then((data) => setUser(data.user))
      .catch((error) => console.log("Error: ", error));
  }, []);

  return (
    <div>
      <p>HELLO</p>
      {user && <h1>{user.name}</h1>}
    </div>
  );
};

export default Welcome;
