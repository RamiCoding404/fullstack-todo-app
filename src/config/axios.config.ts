import axios from "axios";

const axiosinstance = axios.create({
  baseURL: "http://localhost:1337/api",
  timeout: 1000,
});

export default axiosinstance;
