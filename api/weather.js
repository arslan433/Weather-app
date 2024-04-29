import axios from "axios";
import { apikey } from "./apikey";


const forecastEndpoint = params => `http://api.weatherapi.com/v1/forecast.json?key=${apikey}&q=${params.cityName}&days=${params.days}&aqi=no&alerts=no`


const locationEndpoint = params => `http://api.weatherapi.com/v1/search.json?key=${apikey}&q=${params.cityName}`;

// const apiCall = async (endpoint) => {
//     const options = {
//         method : 'GET',
//         url : endpoint
//     }
//     try{
//         const response = await axios.request(options)
//         return response.data
//     }catch(error) {
//         console.error("error" , error)
//         return null
//     }
// }


const apiCall = async (endpoint) => {
    const options = {
        method: 'GET',
        url: endpoint,
    };
    try {
        const response = await axios.request(options);
        console.log("Response received:", response.data);
        return response.data;
    } catch (err) {
        console.error("Error occurred:", err.message);
        // Log more details from the error object if available
        if (err.response) {
            console.error(err.response.data);
            console.error(err.response.status);
            console.error(err.response.headers);
        } else if (err.request) {
            console.error(err.request);
        } else {
            console.error('Error', err.message);
        }
        return null;
    }
};



export const fetchWeatherForecast = params => {
    return apiCall(forecastEndpoint(params))
}
export const fetchLocations = params => {
    return apiCall(locationEndpoint(params))
}