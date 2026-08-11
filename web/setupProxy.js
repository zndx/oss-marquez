const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express')
const path = require('path')

const environmentVariable = (variableName) => {
  const value = process.env[variableName]
  if (!value) {
      console.error(`Error: ${variableName} environment variable is not defined.`)
      console.error(`Please set ${variableName} and restart the application.`)
      process.exit(1)
  }
  return value
}

const marquezHost = environmentVariable("MARQUEZ_HOST")
const marquezPort = environmentVariable("MARQUEZ_PORT")
const webPort = environmentVariable("WEB_PORT")

const apiOptions = {
  target: `http://${marquezHost}:${marquezPort}/`,
  changeOrigin: true,
  logLevel: 'warn',
}

const app = express()
const dist = path.join(__dirname, 'dist')

// Health (no auth, no static)
app.get('/healthcheck', function (req, res) {
  res.send('OK')
})

// Proxy OpenLineage / Marquez-compat API to Atlas SoR first
app.use('/api/v1', createProxyMiddleware(apiOptions))
app.use('/api/v2beta', createProxyMiddleware(apiOptions))

// Static assets from webpack dist — disable directory trailing-slash redirects
// (those 301s broke SPA deep links like /jobs → /jobs/).
app.use(express.static(dist, {
  redirect: false,
  index: false,
  fallthrough: true,
}))

// SPA fallback: any non-file route serves index.html for client-side routing
app.get('*', function (req, res) {
  res.sendFile(path.join(dist, 'index.html'), function (err) {
    if (err) {
      res.status(err.status || 500).send('Marquez UI dist missing — run marquez:build-web')
    }
  })
})

app.listen(webPort, '0.0.0.0', function() {
  console.log(`Marquez web listening on 0.0.0.0:${webPort}`)
  console.log(`  proxy /api/v1 + /api/v2beta → http://${marquezHost}:${marquezPort}`)
  console.log(`  static + SPA fallback → ${dist}`)
})
