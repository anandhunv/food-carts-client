import axios from "axios";

const axiosPublic = axios.create({
    baseURL: 'https://food-carts-server.onrender.com'
})

const useAxiosPublic = () => {
    return axiosPublic;
};

export default useAxiosPublic;
