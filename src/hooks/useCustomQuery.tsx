import { useQuery } from "@tanstack/react-query";
import axiosinstance from "../config/axios.config";
import { AxiosRequestConfig } from "axios";

interface IuseCustomQuery {
  queryKey: string[];
  url: string;
  config?: AxiosRequestConfig;
}
const useCustomQuery = ({ queryKey, url, config }: IuseCustomQuery) => {
  return useQuery({
    queryKey, //queryy caching
    queryFn: async () => {
      const { data } = await axiosinstance.get(url, config);

      return data;
    },
  });
};
export default useCustomQuery;

//custom hook
