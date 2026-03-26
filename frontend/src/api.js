import axios from "axios";

const API = axios.create({
  baseURL: "https://finalyear-project-ml-2.onrender.com"
});

export default API;