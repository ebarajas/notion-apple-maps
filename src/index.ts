import { Router } from 'itty-router'

import { createJWTToken } from './mapkit'
import { getLocationsFromDatabase } from './notion'

const router = Router()

const mapHtml = (databaseId: string) => {
  return `
<html>
<head>
<script src="https://cdn.apple-mapkit.com/mk/5.x.x/mapkit.js"></script>
<style>
body {
  margin: 0;
  padding: 0;
}
#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}
.circle-annotation {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: #FFF;
  background-color: #CCC;
  text-align: center;
  line-height: 32px;
}
</style>
</head>
<body>
<div id="map"></div>
<script>
mapkit.init({
  authorizationCallback: function(done) {
    fetch("/mapkit/jwt")
      .then(res => {
        if (!res.ok) {
          throw Error(res.statusText);
        }
        return res.text()
      })
      .then(done);
    },
    language: "en"
});
var map = new mapkit.Map('map');
var geocoder = new mapkit.Geocoder({language: "en-US", getsUserLocation: false})
fetch("/places/${databaseId}")
  .then(res => res.json())
  .then(places => Promise.all(
    places.map(place => new Promise((resolve, reject) => {
      geocoder.lookup(place, (data, err) => {
        if (err || !data.results.length) {
          return null
        };
        var place = results[0];
        return new mapkit.MarkerAnnotation(place.coordinate, {
          color: "red",
          title: place.name || place.formattedAddress,
          subtitle: place.name ? undefined : place.formattedAddress
        })
      })
    }))
  ))
  .then(markers => {
    var filteredMarkers = markers.filter((marker) => marker != null)
    map.showItems(filteredMarkers, {
      animate: true,
      padding: new mapkit.Padding(60, 25, 60, 25)
    })
  })
  .catch(console.log)
</script>
</body>
</html>
`
}

const BadRequestResponse = () => new Response('Bad Request', { status: 400 })

router.get('/mapkit/jwt', async () => {
  const token = await createJWTToken()
  return new Response(token)
})

router.get('/places/:databaseId', async ({ params }) => {
  if (!params) {
    return BadRequestResponse()
  }

  try {
    const places = await getLocationsFromDatabase(params.databaseId)
    return new Response(JSON.stringify(places), {
      headers: { 'content-type': 'application/json' },
    })
  } catch (err) {
    console.log(err)
    return BadRequestResponse()
  }
})

router.get('/map/:databaseId', ({ params }) => {
  if (!params) {
    return BadRequestResponse()
  }

  const databaseId = params.databaseId

  return new Response(mapHtml(databaseId), {
    headers: { 'content-type': 'text/html' },
  })
})

router.get('/', () => {
  return new Response('Hello World!')
})

router.all('*', () => new Response('Not Found.', { status: 404 }))

const errorHandler = (err: unknown) => {
  console.log('Uncaught Error: ', String(err))
  return new Response('Internal Server Error', { status: 500 })
}

addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(router.handle(event.request).catch(errorHandler))
})
