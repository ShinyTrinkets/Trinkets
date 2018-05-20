---
id: check-weather
trinkets: true
log: true
db: true
---

## Check weather ☀️ 🌦 ☁️

This project checks the weather every 3 hours, in a location that you must specify.

```yaml // const options =
# Specify the location: city, country
PLACE: Dublin, Ireland
# How often to check the weather, in hours
HOURS: 3
```

And the code that does the magic:

```js
const fetch = require('node-fetch')

const api = 'https://query.yahooapis.com/v1/public/yql?format=json&u=c&q=' +
  `select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="${options.PLACE}")`

// Ensure the weather "table" exists
db.defaults({ weather: [] }).write()

function checkWeather () {
  fetch(api)
    .then(resp => resp.json())
    .then(json => {
      const data = extractData(json.query.results.channel)
      db.get('weather').push(data).write()
    })
    .catch(err => console.error(err));
}

// Run heart-beat every minute
trigger('timer', '0 */1 * * * * *', () => log.info('Heartbeat ☀️ 🌦 ☁️'))
// Every X hours, run check weather
trigger('timer', `0 0 */${options.HOURS} * * *`, checkWeather)

// Helper functions
function extractData (y) {
  const data = {
    city: y.location.city,
    country: y.location.country,
    lat: y.item.lat,
    long: y.item.long,
    condition: y.item.condition.text,
    temp: `${y.item.condition.temp}° ${y.units.temperature}`,
    wind: `${y.wind.speed} ${y.units.speed}`,
    humidity: `${y.atmosphere.humidity} %`,
    pubDate: y.item.pubDate
  }
  console.log(`[${data.city}, ${data.country}]`)
  console.log(`${data.condition}, ${data.temp}`)
  console.log(`Wind ${data.wind}`)
  console.log(`Humidity ${data.humidity}`)
  return data
}
```

**Note**: Use of the [Yahoo Weather API](https://developer.yahoo.com/weather/) should not exceed reasonable request volume. Please don't abuse this free service.

<a href="https://www.yahoo.com/?ilc=401" target="_blank"> <img src="https://poweredby.yahoo.com/purple.png" width="134" height="29"/> </a>
