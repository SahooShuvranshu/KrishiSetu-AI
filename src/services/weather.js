// Open-Meteo & IMD Climate Forecast Service
export async function getLocalWeather(lat = 20.2961, lng = 85.8245) { // Default: Odisha (Bhubaneswar)
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=soil_temperature_0cm,soil_moisture_0_to_1cm,relative_humidity_2m`;
    const res = await fetch(url);
    const data = await res.json();
    
    return {
      temperature: data.current_weather?.temperature || 28,
      windSpeed: data.current_weather?.windspeed || 12,
      weatherCode: data.current_weather?.weathercode || 0,
      soilMoisture: data.hourly?.soil_moisture_0_to_1cm?.[0] || 0.35,
      soilTemp: data.hourly?.soil_temperature_0cm?.[0] || 26
    };
  } catch (error) {
    console.warn("Using offline climate fallback:", error);
    return {
      temperature: 29.5,
      windSpeed: 10,
      weatherCode: 1,
      soilMoisture: 0.38,
      soilTemp: 27
    };
  }
}
