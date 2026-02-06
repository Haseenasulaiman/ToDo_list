import React, { useState } from "react";
import axios from "axios";
import MapView from "./MapView";
import "./WeatherApp.css";

// Weather codes mapping for icons
const weatherIcons = {
  0: "☀️", // Clear sky
  1: "🌤️", // Mainly clear
  2: "⛅", // Partly cloudy
  3: "☁️", // Overcast
  45: "🌫️", // Fog
  48: "🌫️", // Depositing rime fog
  51: "🌦️", // Light drizzle
  53: "🌧️", // Moderate drizzle
  55: "🌧️", // Dense drizzle
  61: "🌦️", // Slight rain
  63: "🌧️", // Moderate rain
  65: "🌧️", // Heavy rain
  71: "❄️", // Snow
  73: "❄️", 
  75: "❄️",
  80: "🌦️", // Rain showers
  81: "🌧️", 
  82: "🌧️",
  95: "⛈️", // Thunderstorm
  99: "⛈️", 
};

export default function WeatherApp() {
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState(null);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");

  // Fetch coordinates using OpenStreetMap
  const fetchCoordinates = async (place) => {
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${place}`
      );
      if (res.data.length === 0) {
        setError("Location not found");
        setWeather(null);
        setForecast([]);
        return null;
      }
      return {
        lat: res.data[0].lat,
        lon: res.data[0].lon,
      };
    } catch (err) {
      console.error(err);
      setError("Error fetching location");
    }
  };

  // Fetch weather data using Open-Meteo
  const fetchWeather = async (lat, lon) => {
    try {
      const res = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min,weathercode&current_weather=true&timezone=auto`
      );
      setWeather(res.data.current_weather);
      setForecast(
        res.data.daily.time.map((date, index) => ({
          date,
          max: res.data.daily.temperature_2m_max[index],
          min: res.data.daily.temperature_2m_min[index],
          code: res.data.daily.weathercode[index],
        }))
      );
      setError("");
    } catch (err) {
      console.error(err);
      setError("Error fetching weather data");
    }
  };

  const handleSearch = async () => {
    const result = await fetchCoordinates(location);
    if (result) {
      setCoords(result);
      fetchWeather(result.lat, result.lon);
    }
  };

  return (
    <div className="weather-app">
      <h1>Weather Forecast</h1>

      <div className="search-box">
        <input
          type="text"
          placeholder="Enter location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {error && <p className="error">{error}</p>}

      {weather && coords && (
        <>
          <div className="weather-info">
            <h2>
              {location} {weatherIcons[weather.weathercode] || ""}
            </h2>
            <p>Temperature: {weather.temperature}°C</p>
            <p>Wind Speed: {weather.windspeed} km/h</p>
          </div>

          <MapView
            lat={parseFloat(coords.lat)}
            lon={parseFloat(coords.lon)}
            location={location}
          />

          <div className="forecast">
            <h3>7-Day Forecast</h3>
            <div className="forecast-grid">
              {forecast.map((day) => (
                <div key={day.date} className="forecast-day">
                  <p>{day.date}</p>
                  <p>{weatherIcons[day.code] || "🌤️"}</p>
                  <p>
                    {day.max}°C / {day.min}°C
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
